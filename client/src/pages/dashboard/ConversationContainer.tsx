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
    const getLocalMediaStream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia(
            mediaConstraints
        );
        attachVideoStream(localVideoRef.current, stream);
        return stream;
    }, []);

    const addLocalTracks = useCallback(
        async (peerConnection: RTCPeerConnection) => {
            const stream = await getLocalMediaStream();
            stream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, stream);
            });
        },
        [getLocalMediaStream]
    );
    const attachRemoteTrack = useCallback((track: MediaStreamTrack) => {
        if (!remoteStream.current) {
            remoteStream.current = new MediaStream();
            attachVideoStream(remoteVideoRef.current, remoteStream.current);
        }
        remoteStream.current.addTrack(track);
    }, []);

        const createPeerConnection = useCallback(async function (peerId: string) {
        setCallActive(true);
      
            try {
                const peerConnection = new RTCPeerConnection({
                    iceServers: rtcIceServers,
                });
                const localPC = (localPeerConnection.current = peerConnection);
                
                localPC.onicecandidate = async (event) => {
                    console.log("new ice candidate",event.candidate);

                    if (event.candidate) {
                        socket.emit('new-ice-candidate', {
                            peerId,
                            candidate: event.candidate,
                        });
                    }
                };
                localPC.oniceconnectionstatechange = () => {
                    console.log('ICE state:', localPC.iceConnectionState);
                };
                localPC.ontrack = (event) => {
                    console.log('received track');

                    attachRemoteTrack(event.track);
                };
                return localPC;
            } catch (err) {
                console.log('error', err);
            }
            return null;
    },[attachRemoteTrack])

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
        async function handleVideOffer(message: {
            sdp: RTCSessionDescriptionInit;
            peer: User;
        }) {
            try {
                remotePeer.current = message.peer;
                const peerConnection = await createPeerConnection(
                    message.peer.id
                );

                if (peerConnection?.signalingState !== 'stable') {
                    return;
                }

                //set remote description
                const remoteDesc = new RTCSessionDescription(message.sdp);
                await peerConnection?.setRemoteDescription(remoteDesc);
                await addLocalTracks(peerConnection);

                for (const candidate of localIceCandidates.current) {
                    try {
                        await peerConnection?.addIceCandidate(candidate);
                    } catch (err) {
                        console.error('Error adding buffered ICE', err);
                    }
                }
                localIceCandidates.current = [];

                //set local description and send video answer
                const offer = await peerConnection?.createAnswer();
                await peerConnection?.setLocalDescription(offer);

                //to server
                socket.emit('video-answer', {
                    sdp: peerConnection?.localDescription!,
                    peer: message.peer,
                });
                // ackCallback('acknowledged', null);
            } catch (error) {
                console.error(error);
            }
        }

        async function handleVideoAnswer(data: {
            sdp: RTCSessionDescription;
            peer: User;
        }) {
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
        }

        async function handleNewIceCandidate(data: {
            candidate: RTCIceCandidateInit;
            peerId: string;
        }) {
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
        }

        socket.on('video-offer', handleVideOffer);
        socket.on('new-ice-candidate', handleNewIceCandidate);
        socket.on('video-answer', handleVideoAnswer);

        return () => {
            socket.off('video-offer', handleVideOffer);
            socket.off('new-ice-candidate', handleNewIceCandidate);
            socket.off('video-answer', handleVideoAnswer);
        };
    }, [addLocalTracks, createPeerConnection]);


    async function cleanup() {
        if (localPeerConnection.current) {
            localPeerConnection.current.onicecandidate = null;
            localPeerConnection.current.oniceconnectionstatechange = null;
            localPeerConnection.current.ontrack = null;
            await localPeerConnection.current.setLocalDescription(undefined);
            localPeerConnection.current = null;
        }
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    }
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
                                if (!selectedConversationUser?.id) return;
                                const peerConnection = await createPeerConnection(
                                    selectedConversationUser.id
                                );
                                if (!peerConnection) return;
                                
                                await addLocalTracks(peerConnection); //order important: add tracks to peer before creating offer

                                const offer =
                                await peerConnection.createOffer();
                                await peerConnection.setLocalDescription(
                                    offer
                                );
                                console.log(selectedConversationUser);
                                
                                if (selectedConversationUser) {
                                    socket.emit(
                                        'video-call',
                                        {
                                            sdp: peerConnection
                                                .localDescription!,
                                            peer: selectedConversationUser,
                                        },
                                        (ack) => {
                                            console.log(ack);
                                        }
                                    );
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
