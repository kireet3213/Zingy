import { useCallback, useEffect, useRef, useState } from 'react';
import { ConversationBox } from './ConversationBox';
import { useUserEvents } from '../../hooks/useUserEvents.ts';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import {
    selectConversationUsers,
    selectSelectedConversationUser,
    upsertConversationUser,
} from './conversationSlice.ts';
import { selectCurrentUser } from '../auth/authSlice.ts';
import {
    useGetUserConversationsQuery,
    type UserConversationApiPayload,
} from '../../apiSlice.ts';
import { UserConversation } from './types/conversation.ts';
import { Video } from 'lucide-react';
import { socket } from '../../socket';
import { User } from '@shared-types/socket.ts';

const mediaConstraints = {
    audio: false,
    video: true,
};
const rtcIceServers: RTCIceServer[] = [
    {
        urls: 'stun:stun.l.google.com:19302',
    },
    {
        urls: 'turn:localhost:8080',
        username: 'webrtc',
        credential: 'webrtc',
    },
];
export function ConversationContainer() {
    const dispatch = useAppDispatch();
    const conversationUsers = useAppSelector(selectConversationUsers);
    const authUser = useAppSelector(selectCurrentUser);
    const selectedConversationUser = useAppSelector(
        selectSelectedConversationUser
    );
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const remoteStream = useRef<MediaStream | null>(null);
    const isRemoteDescSetOnAnswer = useRef<boolean>(false);
    const [callActive, setCallActive] = useState<boolean>(false);
    const localPeerConnection = useRef<RTCPeerConnection | null>(null);

    const { data: conversationsData } = useGetUserConversationsQuery();
    useUserEvents();

    const remotePeer = useRef<User>(null);
    const localIceCandidates = useRef<RTCIceCandidate[]>([]);
    const attachVideoStream = (
        videoElement: HTMLVideoElement | null,
        stream: MediaStream
    ) => {
        if (!videoElement) return;
        videoElement.srcObject = stream;
    };
    const attachRemoteTrack = useCallback((track: MediaStreamTrack) => {
        if (!remoteStream.current) {
            remoteStream.current = new MediaStream();
            attachVideoStream(remoteVideoRef.current, remoteStream.current);
        }
        remoteStream.current.addTrack(track);
    },[]);

    useEffect(() => {
        if (!conversationsData?.conversations || !authUser) return;
        conversationsData.conversations.forEach(
            (conv: UserConversationApiPayload) => {
                if (!conv.peer) return;
                const userConv: UserConversation = {
                    id: conv.peer.id,
                    conversationId: conv.conversationId,
                    senderName: conv.peer.username,
                    profileImageUrl: conv.peer.userProfile?.profileUrl ?? '',
                    self: conv.peer.id === authUser.id,
                };
                dispatch(upsertConversationUser(userConv));
            }
        );
    }, [conversationsData, authUser, dispatch]);

    useEffect(() => {
        socket.on('video-offer', async (message) => {
            try {
                remotePeer.current = message.peer;
                const peerConnection = new RTCPeerConnection({
                    iceServers: rtcIceServers,
                });
                localPeerConnection.current = peerConnection;

                peerConnection.ontrack = (event) => {
                    attachRemoteTrack(event.track);
                };
                peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        if (!remotePeer.current) return;

                        socket.emit('new-ice-candidate', {
                            peerId: remotePeer.current.id,
                            candidate: event.candidate,
                        });
                    }
                };

                if (peerConnection.signalingState !== 'stable') {
                    return;
                }
                // //set remote description
                const remoteDesc = new RTCSessionDescription(message.sdp);
                await peerConnection.setRemoteDescription(remoteDesc);

                const mediaStream =
                    await navigator.mediaDevices.getUserMedia(mediaConstraints);

                attachVideoStream(localVideoRef.current, mediaStream);
                mediaStream.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, mediaStream);
                });

                for (const candidate of localIceCandidates.current) {
                    try {
                        await peerConnection.addIceCandidate(candidate);
                    } catch (err) {
                        console.error('Error adding buffered ICE', err);
                    }
                }
                localIceCandidates.current = [];

                peerConnection.oniceconnectionstatechange = () => {
                    console.log(
                        'ICE state:',
                        localPeerConnection.current?.iceConnectionState
                    );
                };

                //set local description and send video answer
                const offer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(offer);

                //to server
                socket.emit('video-answer', {
                    sdp: peerConnection.localDescription!,
                    peer: message.peer,
                });
                // ackCallback('acknowledged', null);
            } catch (error) {
                console.error(error);
            }
        });

        socket.on('video-answer', async (data) => {
            try {
                const remoteDesc = new RTCSessionDescription(data.sdp);

                if (localPeerConnection.current) {
                    if (
                        localPeerConnection.current.signalingState !==
                        'have-local-offer'
                    )
                        return;

                    await localPeerConnection.current.setRemoteDescription(
                        remoteDesc
                    );
                    isRemoteDescSetOnAnswer.current = true;
                    for (const candidate of localIceCandidates.current) {
                        try {
                            await localPeerConnection.current.addIceCandidate(
                                candidate
                            );
                        } catch (err) {
                            console.error('Error adding buffered ICE', err);
                        }
                    }
                    localIceCandidates.current = [];
                }
            } catch (error) {
                console.error(error);
            }
        });
        socket.on('new-ice-candidate', async (data) => {
            const candidate = new RTCIceCandidate(data.candidate);

            if (!localPeerConnection.current) return;

            if (localPeerConnection.current.remoteDescription) {
                try {
                    await localPeerConnection.current.addIceCandidate(
                        candidate
                    );
                } catch (err) {
                    console.error('Error adding ICE candidate', err);
                }
            } else {
                localIceCandidates.current.push(candidate);
            }
        });
    }, [attachRemoteTrack]);
    return (
        <div className="relative flex min-h-0 flex-col bg-slate-900/60 border-r border-white/5 overflow-y-auto w-full md:w-80 md:shrink-0 max-h-[35vh] md:max-h-none">
            <div className="relative z-10 px-4 py-3 border-b border-white/5 flex items-center gap-3">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Messages
                </h2>
                <div className="ml-auto flex items-center gap-3">
                    {authUser && (
                        <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                            {authUser.username}
                        </span>
                    )}
                    <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-800/90 text-white shadow-sm"
                        onClick={async () => {
                            setCallActive(!callActive);
                            if (selectedConversationUser?.self) {
                                alert('Cannot call self');
                                return;
                            } else if (!callActive) {
                                try {
                                    const peerConnection =
                                        new RTCPeerConnection({
                                            iceServers: rtcIceServers,
                                        });
                                    localPeerConnection.current =
                                        peerConnection;

                                    const stream =
                                        await navigator.mediaDevices.getUserMedia(
                                            mediaConstraints
                                        );

                                    attachVideoStream(
                                        localVideoRef.current,
                                        stream
                                    );

                                    stream.getTracks().forEach((track) => {
                                        peerConnection.addTrack(track, stream);
                                    });
                                    peerConnection.onicecandidate = async (
                                        event
                                    ) => {
                                        console.log(event.candidate);

                                        if (event.candidate) {
                                            if (selectedConversationUser) {
                                                socket.emit(
                                                    'new-ice-candidate',
                                                    {
                                                        peerId: selectedConversationUser.id,
                                                        candidate:
                                                            event.candidate,
                                                    }
                                                );
                                            }
                                        }
                                    };
                                    peerConnection.oniceconnectionstatechange =
                                        () => {
                                            console.log(
                                                'ICE state:',
                                                localPeerConnection.current
                                                    ?.iceConnectionState
                                            );
                                        };
                                    peerConnection.ontrack = (event) => {
                                        attachRemoteTrack(event.track);
                                    };

                                    const offer =
                                        await peerConnection.createOffer();
                                    await peerConnection.setLocalDescription(
                                        offer
                                    );

                                    if (selectedConversationUser) {
                                        socket.emit(
                                            'video-call',
                                            {
                                                sdp: peerConnection.localDescription!,
                                                peer: selectedConversationUser,
                                            },
                                            (ack) => {
                                                console.log(ack);
                                            }
                                        );
                                    }
                                } catch (error) {
                                    console.log(error);
                                }
                            } else {
                                if (localVideoRef.current)
                                    localVideoRef.current.srcObject = null;
                            }
                        }}
                    >
                        <Video color="#ffffff" strokeWidth={1.75} size={18} />
                    </button>
                </div>
            </div>
            <ConversationBox conversationUsers={conversationUsers} />
            <video
                style={{
                    position: 'absolute',
                    top: '57px',
                    height: '159px',
                    width: '180px',
                    background: '#afbfcd',
                    zIndex: 1,
                    right: 0,
                    pointerEvents: 'none',
                }}
                autoPlay
                muted
                playsInline
                ref={localVideoRef}
            ></video>
            <video
                style={{
                    position: 'absolute',
                    top: '224px',
                    height: '159px',
                    width: '180px',
                    background: '#8fcbff',
                    zIndex: 1,
                    right: 0,
                    pointerEvents: 'none',
                }}
                autoPlay
                muted
                playsInline
                ref={remoteVideoRef}
            ></video>
        </div>
    );
}
