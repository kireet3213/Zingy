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
import { PhoneOff, Video } from 'lucide-react';
import { socket } from '../../socket';
import { User } from '@shared-types/socket.ts';

const mediaConstraints = {
    audio: false,
    video: true,
};

const getConfiguredTurnUrls = (): string[] => {
    const configuredTurnUrl =
        localStorage.getItem('turnUrl') || import.meta.env.VITE_TURN_URL || '';
    if (configuredTurnUrl) {
        return [configuredTurnUrl];
    }

    const configuredServerUrl =
        localStorage.getItem('serverUrl') ||
        import.meta.env.VITE_API_URL ||
        window.location.origin;

    const serverUrl = new URL(configuredServerUrl);

    if (URL.canParse(serverUrl)) {
        const host = serverUrl.hostname;
        return [
            `turn:${host}:3478?transport=udp`,
            `turn:${host}:3478?transport=tcp`,
        ];
    } else {
        return [
            'turn:127.0.0.1:3478?transport=udp',
            'turn:127.0.0.1:3478?transport=tcp',
        ];
    }
};

const getRtcIceServers = (): RTCIceServer[] => [
    {
        urls: getConfiguredTurnUrls(),
        username: 'devuser',
        credential: 'devpass',
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

    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStream = useRef<MediaStream | null>(null);
    const [callActive, setCallActive] = useState<boolean>(false);
    const localPeerConnection = useRef<RTCPeerConnection | null>(null);

    const { data: conversationsData } = useGetUserConversationsQuery();
    useUserEvents();

    const activePeerId = useRef<string | null>(null);
    const localIceCandidates = useRef<RTCIceCandidate[]>([]);
    const attachVideoStream = (
        videoElement: HTMLVideoElement | null,
        stream: MediaStream
    ) => {
        if (!videoElement) return;
        if (videoElement.srcObject === stream) return;
        videoElement.srcObject = stream;
    };

    const setLocalVideoElement = useCallback(
        (videoElement: HTMLVideoElement | null) => {
            localVideoRef.current = videoElement;
            if (videoElement && localStreamRef.current) {
                attachVideoStream(videoElement, localStreamRef.current);
            }
        },
        []
    );

    const setRemoteVideoElement = useCallback(
        (videoElement: HTMLVideoElement | null) => {
            remoteVideoRef.current = videoElement;
            if (videoElement && remoteStream.current) {
                attachVideoStream(videoElement, remoteStream.current);
            }
        },
        []
    );

    const ensureRemoteStream = useCallback(() => {
        if (!remoteStream.current) {
            remoteStream.current = new MediaStream();
        }
        attachVideoStream(remoteVideoRef.current, remoteStream.current);
        return remoteStream.current;
    }, []);

    const getLocalMediaStream = useCallback(async () => {
        if (localStreamRef.current) {
            attachVideoStream(localVideoRef.current, localStreamRef.current);
            return localStreamRef.current;
        }

        const stream =
            await navigator.mediaDevices.getUserMedia(mediaConstraints);
        localStreamRef.current = stream;
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
    const attachRemoteMedia = useCallback(
        (event: RTCTrackEvent) => {
            const stream = event.streams[0];
            if (stream) {
                remoteStream.current = stream;
                attachVideoStream(remoteVideoRef.current, stream);
                return;
            }

            const fallbackStream = ensureRemoteStream();
            if (!fallbackStream.getTrackById(event.track.id)) {
                fallbackStream.addTrack(event.track);
            }
        },
        [ensureRemoteStream]
    );

    useEffect(() => {
        if (callActive && localStreamRef.current) {
            attachVideoStream(localVideoRef.current, localStreamRef.current);
        }
        if (callActive && remoteStream.current) {
            attachVideoStream(remoteVideoRef.current, remoteStream.current);
        }
    }, [callActive]);

    const cleanup = useCallback(async (notifyPeer = false) => {
        const peerId = activePeerId.current;
        if (notifyPeer && peerId) {
            socket.emit('video-hangup', { peerId });
        }

        const localVideo = localVideoRef.current?.srcObject;
        if (localVideo instanceof MediaStream) {
            localVideo.getTracks().forEach((track) => {
                track.stop();
            });
        }

        const remoteVideo = remoteVideoRef.current?.srcObject;
        if (remoteVideo instanceof MediaStream) {
            remoteVideo.getTracks().forEach((track) => {
                track.stop();
            });
        }

        if (localPeerConnection.current) {
            localPeerConnection.current.onicecandidate = null;
            localPeerConnection.current.oniceconnectionstatechange = null;
            localPeerConnection.current.ontrack = null;
            localPeerConnection.current.close();
            localPeerConnection.current = null;
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        localStreamRef.current = null;
        remoteStream.current = null;
        activePeerId.current = null;
        localIceCandidates.current = [];
        setCallActive(false);
    }, []);

    const createPeerConnection = useCallback(
        async function (peerId: string) {
            setCallActive(true);
            activePeerId.current = peerId;

            try {
                const peerConnection = new RTCPeerConnection({
                    iceServers: getRtcIceServers(),
                    iceTransportPolicy: 'relay',
                });
                const localPC = (localPeerConnection.current = peerConnection);

                localPC.onicecandidate = async (event) => {
                    console.log('new ice candidate', event.candidate);

                    if (event.candidate) {
                        socket.emit('new-ice-candidate', {
                            peerId,
                            candidate: event.candidate,
                        });
                    }
                };
                localPC.oniceconnectionstatechange = async () => {
                    console.log('ICE state:', localPC.iceConnectionState);
                    switch (localPC.iceConnectionState) {
                        case 'closed':
                        case 'failed':
                            await cleanup(false);
                            break;
                    }
                };
                localPC.ontrack = (event) => {
                    console.log('received track');

                    attachRemoteMedia(event);
                };
                return localPC;
            } catch (err) {
                console.log('error', err);
            }
            return null;
        },
        [attachRemoteMedia, cleanup]
    );

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
                activePeerId.current = message.peer.id;
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
                activePeerId.current = data.peer.id;

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

        async function handleVideoHangup() {
            console.log('video hangup..');

            await cleanup(false);
        }

        socket.on('video-offer', handleVideOffer);
        socket.on('new-ice-candidate', handleNewIceCandidate);
        socket.on('video-answer', handleVideoAnswer);
        socket.on('video-hangup', handleVideoHangup);

        return () => {
            socket.off('video-offer', handleVideOffer);
            socket.off('new-ice-candidate', handleNewIceCandidate);
            socket.off('video-answer', handleVideoAnswer);
            socket.off('video-hangup', handleVideoHangup);
        };
    }, [addLocalTracks, cleanup, createPeerConnection]);

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
                                const peerConnection =
                                    await createPeerConnection(
                                        selectedConversationUser.id
                                    );
                                if (!peerConnection) return;

                                await addLocalTracks(peerConnection); //order important: add tracks to peer before creating offer

                                const offer =
                                    await peerConnection.createOffer();
                                await peerConnection.setLocalDescription(offer);
                                console.log(selectedConversationUser);

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
                            } else {
                                await cleanup(true);
                            }
                        }}
                    >
                        <Video color="#ffffff" strokeWidth={1.75} size={18} />
                    </button>
                </div>
            </div>
            <ConversationBox conversationUsers={conversationUsers} />
            {callActive && (
                <div className="fixed inset-0 z-50 bg-black">
                    <video
                        className="h-full w-full object-cover bg-black"
                        autoPlay
                        playsInline
                        ref={setRemoteVideoElement}
                    ></video>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 bg-linear-to-t from-black/80 via-black/35 to-transparent px-6 pb-8 pt-24">
                        <video
                            className="pointer-events-auto h-36 w-56 rounded-2xl border border-white/15 bg-slate-950 object-cover shadow-2xl"
                            autoPlay
                            muted
                            playsInline
                            ref={setLocalVideoElement}
                        ></video>
                        <button
                            type="button"
                            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/40"
                            onClick={async () => {
                                await cleanup(true);
                            }}
                        >
                            <PhoneOff size={18} />
                            Hang up
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
