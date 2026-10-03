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
import { Phone, PhoneOff, Video } from 'lucide-react';
import { socket } from '../../socket';
import { User } from '@shared-types/socket.ts';
import {
    startRingtone,
    stopRingtone,
    playHangupTone,
} from '../../helpers/ringtone';

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
    // {
    //     urls: 'stun:stun.l.google.com:19302',
    // },
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
    const [ringing, setRinging] = useState<boolean>(false);
    const [incomingCall, setIncomingCall] = useState<User | null>(null);
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
        stopRingtone();
        if (localPeerConnection.current) {
            playHangupTone();
        }
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
        setRinging(false);
        setIncomingCall(null);
    }, []);

    const createPeerConnection = useCallback(
        async function (peerId: string) {
            setCallActive(true);
            activePeerId.current = peerId;

            try {
                const peerConnection = new RTCPeerConnection({
                    iceServers: getRtcIceServers(),
                    iceTransportPolicy: 'relay', // force TURN for testing coturn
                });
                const localPC = (localPeerConnection.current = peerConnection);

                localPC.onicecandidate = async (event) => {
                    // eslint-disable-next-line no-console
                    console.log('new ice candidate', event.candidate);

                    if (event.candidate) {
                        socket.emit('new-ice-candidate', {
                            peerId,
                            candidate: event.candidate,
                        });
                    }
                };
                localPC.oniceconnectionstatechange = async () => {
                    // eslint-disable-next-line no-console
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
                // eslint-disable-next-line no-console
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
        // Receiver gets an incoming call ring
        function handleIncomingCall(data: { peer: User }) {
            startRingtone();
            setIncomingCall(data.peer);
        }

        // Caller is notified that the peer accepted
        async function handleCallAccepted(data: { peer: User }) {
            setRinging(false);
            try {
                const peerConnection = await createPeerConnection(data.peer.id);
                if (!peerConnection) return;

                await addLocalTracks(peerConnection);

                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);

                socket.emit(
                    'video-call',
                    {
                        sdp: peerConnection.localDescription!,
                        peer: {
                            id: data.peer.id,
                            senderName: data.peer.username,
                            profileImageUrl:
                                data.peer.userProfile?.profileUrl ?? '',
                            self: false,
                        },
                    },
                    (ack) => {
                        // eslint-disable-next-line no-console
                        console.log(ack);
                    }
                );
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            }
        }

        // Caller is notified that the peer declined
        function handleCallDeclined() {
            setRinging(false);
            activePeerId.current = null;
        }

        // Receiver gets the actual WebRTC offer after accepting
        async function handleVideoOffer(message: {
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

                const remoteDesc = new RTCSessionDescription(message.sdp);
                await peerConnection?.setRemoteDescription(remoteDesc);
                await addLocalTracks(peerConnection);

                for (const candidate of localIceCandidates.current) {
                    try {
                        await peerConnection?.addIceCandidate(candidate);
                    } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error('Error adding buffered ICE', err);
                    }
                }
                localIceCandidates.current = [];

                const answer = await peerConnection?.createAnswer();
                await peerConnection?.setLocalDescription(answer);

                socket.emit('video-answer', {
                    sdp: peerConnection.localDescription!,
                    peer: message.peer,
                });
            } catch (error) {
                // eslint-disable-next-line no-console
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
                            // eslint-disable-next-line no-console
                            console.error('Error adding buffered ICE', err);
                        }
                    }
                    localIceCandidates.current = [];
                }
            } catch (error) {
                // eslint-disable-next-line no-console
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
                    // eslint-disable-next-line no-console
                    console.error('Error adding ICE candidate', err);
                }
            } else {
                localIceCandidates.current.push(candidate);
            }
        }

        async function handleVideoHangup() {
            await cleanup(false);
        }

        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted', handleCallAccepted);
        socket.on('call-declined', handleCallDeclined);
        socket.on('video-offer', handleVideoOffer);
        socket.on('new-ice-candidate', handleNewIceCandidate);
        socket.on('video-answer', handleVideoAnswer);
        socket.on('video-hangup', handleVideoHangup);

        return () => {
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleCallAccepted);
            socket.off('call-declined', handleCallDeclined);
            socket.off('video-offer', handleVideoOffer);
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
                            if (selectedConversationUser?.self) {
                                alert('Cannot call self');
                                return;
                            }
                            if (!callActive && !ringing) {
                                if (!selectedConversationUser?.id) return;
                                setRinging(true);
                                activePeerId.current =
                                    selectedConversationUser.id;
                                socket.emit('video-call-ring', {
                                    peer: selectedConversationUser,
                                });
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
            {incomingCall && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-6 rounded-3xl bg-slate-900 border border-white/10 px-12 py-10 shadow-2xl">
                        <div className="h-20 w-20 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <Video className="text-indigo-400" size={36} />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-white">
                                {incomingCall.username}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Incoming video call...
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg"
                                onClick={() => {
                                    stopRingtone();
                                    socket.emit('call-declined', {
                                        peer: incomingCall,
                                    });
                                    setIncomingCall(null);
                                }}
                            >
                                <PhoneOff size={18} />
                                Decline
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg"
                                onClick={() => {
                                    stopRingtone();
                                    socket.emit('call-accepted', {
                                        peer: incomingCall,
                                    });
                                    setIncomingCall(null);
                                }}
                            >
                                <Phone size={18} />
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {ringing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-6 rounded-3xl bg-slate-900 border border-white/10 px-12 py-10 shadow-2xl">
                        <div className="h-20 w-20 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
                            <Video className="text-indigo-400" size={36} />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-white">
                                Calling {selectedConversationUser?.senderName}
                                ...
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Ringing
                            </p>
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg"
                            onClick={async () => {
                                if (activePeerId.current) {
                                    socket.emit('video-hangup', {
                                        peerId: activePeerId.current,
                                    });
                                }
                                setRinging(false);
                                activePeerId.current = null;
                            }}
                        >
                            <PhoneOff size={18} />
                            Cancel
                        </button>
                    </div>
                </div>
            )}
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
