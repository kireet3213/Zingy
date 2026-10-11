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
import {
    Gamepad2,
    Mic,
    MicOff,
    Monitor,
    MonitorOff,
    Phone,
    PhoneOff,
    Video,
} from 'lucide-react';
import { DoomGame } from './DoomGame';
import { socket } from '../../socket';
import { User } from '@shared-types/socket.ts';
import {
    startRingtone,
    stopRingtone,
    playHangupTone,
} from '../../helpers/ringtone';

const mediaConstraints = {
    audio: true,
    video: true,
};

const turnUsername =
    import.meta.env.VITE_TURN_USERNAME || '';
const turnCredential =
    import.meta.env.VITE_TURN_CREDENTIAL || '';

const getRtcIceServers = (): RTCIceServer[] => [
    {
        urls: 'stun:stun.relay.metered.ca:80',
    },
    {
        urls: 'turn:standard.relay.metered.ca:80',
        username: turnUsername,
        credential: turnCredential,
    },
    {
        urls: 'turn:standard.relay.metered.ca:80?transport=tcp',
        username: turnUsername,
        credential: turnCredential,
    },
    {
        urls: 'turn:standard.relay.metered.ca:443',
        username: turnUsername,
        credential: turnCredential,
    },
    {
        urls: 'turns:standard.relay.metered.ca:443?transport=tcp',
        username: turnUsername,
        credential: turnCredential,
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
    const screenStreamRef = useRef<MediaStream | null>(null);
    const remoteStream = useRef<MediaStream | null>(null);
    const [callActive, setCallActive] = useState<boolean>(false);
    const [ringing, setRinging] = useState<boolean>(false);
    const [incomingCall, setIncomingCall] = useState<User | null>(null);
    const [micEnabled, setMicEnabled] = useState<boolean>(true);
    const [screenSharing, setScreenSharing] = useState<boolean>(false);
    const [peerScreenSharing, setPeerScreenSharing] = useState<boolean>(false);
    const [sidebarWidth, setSidebarWidth] = useState<number>(256);
    const isResizing = useRef<boolean>(false);
    const [doomOpen, setDoomOpen] = useState<boolean>(false);
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
        videoElement.play().catch((err) => {
            // eslint-disable-next-line no-console
            console.warn('autoplay blocked:', err);
        });
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
            if (videoElement) {
                videoElement.muted = false;
                videoElement.volume = 1.0;
                if (remoteStream.current) {
                    attachVideoStream(videoElement, remoteStream.current);
                }
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
        stream.getAudioTracks().forEach((track) => {
            track.enabled = true;
        });
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
            } else {
                const fallbackStream = ensureRemoteStream();
                if (!fallbackStream.getTrackById(event.track.id)) {
                    fallbackStream.addTrack(event.track);
                }
            }

            if (remoteVideoRef.current) {
                remoteVideoRef.current.muted = false;
                remoteVideoRef.current.volume = 1.0;
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

    const toggleMic = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const audioTracks = stream.getAudioTracks();
        const newEnabled = !micEnabled;
        audioTracks.forEach((track) => {
            track.enabled = newEnabled;
        });
        setMicEnabled(newEnabled);
    }, [micEnabled]);

    const stopScreenSharing = useCallback(() => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
        }

        // Restore camera track on the peer connection
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        if (cameraTrack && localPeerConnection.current) {
            const sender = localPeerConnection.current
                .getSenders()
                .find((s) => s.track?.kind === 'video');
            if (sender) {
                sender.replaceTrack(cameraTrack);
            }
        }

        setScreenSharing(false);
        if (activePeerId.current) {
            socket.emit('screen-share-state', {
                peerId: activePeerId.current,
                isSharing: false,
            });
        }
    }, []);

    const toggleScreenShare = useCallback(async () => {
        if (screenSharing) {
            stopScreenSharing();
            return;
        }

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });
            screenStreamRef.current = screenStream;

            const screenTrack = screenStream.getVideoTracks()[0];

            // Replace the camera video track with screen track on the peer connection
            if (localPeerConnection.current) {
                const sender = localPeerConnection.current
                    .getSenders()
                    .find((s) => s.track?.kind === 'video');
                if (sender) {
                    await sender.replaceTrack(screenTrack);
                }
            }

            // When user stops sharing via browser UI
            screenTrack.onended = () => {
                stopScreenSharing();
            };

            setScreenSharing(true);
            if (activePeerId.current) {
                socket.emit('screen-share-state', {
                    peerId: activePeerId.current,
                    isSharing: true,
                });
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('Screen sharing cancelled or failed:', err);
        }
    }, [screenSharing, stopScreenSharing]);

    const handleResizeStart = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            isResizing.current = true;

            const onMouseMove = (ev: MouseEvent) => {
                if (!isResizing.current) return;
                const newWidth = window.innerWidth - ev.clientX;
                const clamped = Math.min(480, Math.max(200, newWidth));
                setSidebarWidth(clamped);
            };

            const onMouseUp = () => {
                isResizing.current = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            };

            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        },
        []
    );

    const cleanup = useCallback(async (notifyPeer = false) => {
        stopRingtone();
        if (localPeerConnection.current) {
            playHangupTone();
        }
        const peerId = activePeerId.current;
        if (notifyPeer && peerId) {
            socket.emit('video-hangup', { peerId });
        }

        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
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
        setMicEnabled(true);
        setScreenSharing(false);
        setPeerScreenSharing(false);
        setDoomOpen(false);
    }, []);

    const createPeerConnection = useCallback(
        async function (peerId: string) {
            setCallActive(true);
            activePeerId.current = peerId;

            try {
                const peerConnection = new RTCPeerConnection({
                    iceServers: getRtcIceServers(),
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
                    // eslint-disable-next-line no-console
                    console.log('received track:', event.track.kind, 'enabled:', event.track.enabled);
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
        function handleIncomingCall(data: { peer: User }) {
            startRingtone();
            setIncomingCall(data.peer);
        }

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

        function handleCallDeclined() {
            setRinging(false);
            activePeerId.current = null;
        }

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

        function handleScreenShareState(data: {
            peerId: string;
            isSharing: boolean;
        }) {
            setPeerScreenSharing(data.isSharing);
        }

        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted', handleCallAccepted);
        socket.on('call-declined', handleCallDeclined);
        socket.on('video-offer', handleVideoOffer);
        socket.on('new-ice-candidate', handleNewIceCandidate);
        socket.on('video-answer', handleVideoAnswer);
        socket.on('video-hangup', handleVideoHangup);
        socket.on('screen-share-state', handleScreenShareState);

        return () => {
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleCallAccepted);
            socket.off('call-declined', handleCallDeclined);
            socket.off('video-offer', handleVideoOffer);
            socket.off('new-ice-candidate', handleNewIceCandidate);
            socket.off('video-answer', handleVideoAnswer);
            socket.off('video-hangup', handleVideoHangup);
            socket.off('screen-share-state', handleScreenShareState);
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

            {/* Incoming call modal */}
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

            {/* Ringing modal */}
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

            {/* Active call - Teams-like layout */}
            {callActive && (
                <div className="fixed inset-0 z-50 flex h-screen bg-slate-950">
                    {/* Main area - remote video */}
                    <div className="relative flex min-w-0 flex-1 flex-col">
                        {/* Remote video fills main area */}
                        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-slate-900">
                            <video
                                className={`h-full w-full bg-black ${
                                    peerScreenSharing
                                        ? 'object-contain'
                                        : 'object-cover'
                                }`}
                                autoPlay
                                playsInline
                                ref={setRemoteVideoElement}
                            ></video>
                            {doomOpen && (
                                <DoomGame onClose={() => setDoomOpen(false)} />
                            )}
                        </div>

                        {/* Bottom control bar */}
                        <div className="flex shrink-0 items-center justify-center gap-3 bg-slate-900/95 border-t border-white/5 px-6 py-4">
                            <button
                                type="button"
                                className={`inline-flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors ${
                                    micEnabled
                                        ? 'bg-slate-700 hover:bg-slate-600'
                                        : 'bg-slate-700/60 hover:bg-slate-600/60 ring-2 ring-red-500/50'
                                }`}
                                onClick={toggleMic}
                                title={micEnabled ? 'Mute mic' : 'Unmute mic'}
                            >
                                {micEnabled ? (
                                    <Mic size={20} className="text-white" />
                                ) : (
                                    <MicOff
                                        size={20}
                                        className="text-red-400"
                                    />
                                )}
                            </button>
                            <button
                                type="button"
                                className={`inline-flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors ${
                                    screenSharing
                                        ? 'bg-indigo-600 hover:bg-indigo-500 ring-2 ring-indigo-400/50'
                                        : 'bg-slate-700 hover:bg-slate-600'
                                }`}
                                onClick={toggleScreenShare}
                                title={
                                    screenSharing
                                        ? 'Stop sharing'
                                        : 'Share screen'
                                }
                            >
                                {screenSharing ? (
                                    <MonitorOff
                                        size={20}
                                        className="text-white"
                                    />
                                ) : (
                                    <Monitor
                                        size={20}
                                        className="text-white"
                                    />
                                )}
                            </button>
                            <button
                                type="button"
                                className={`inline-flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors ${
                                    doomOpen
                                        ? 'bg-green-600 hover:bg-green-500 ring-2 ring-green-400/50'
                                        : 'bg-slate-700 hover:bg-slate-600'
                                }`}
                                onClick={() => setDoomOpen((v) => !v)}
                                title={doomOpen ? 'Close DOOM' : 'Play DOOM'}
                            >
                                <Gamepad2 size={20} className="text-white" />
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/40 hover:bg-red-500"
                                onClick={async () => {
                                    await cleanup(true);
                                }}
                            >
                                <PhoneOff size={18} />
                                Hang up
                            </button>
                        </div>
                    </div>

                    {/* Sidebar - local video (resizable) */}
                    <div
                        className="relative flex shrink-0 flex-col bg-slate-900/80"
                        style={{ width: sidebarWidth }}
                    >
                        {/* Resize handle */}
                        <div
                            className="absolute inset-y-0 left-0 z-10 w-1.5 cursor-col-resize border-l border-white/5 transition-colors hover:bg-indigo-500/40"
                            onMouseDown={handleResizeStart}
                        />
                        <div className="px-3 py-3 border-b border-white/5">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                You
                            </p>
                        </div>
                        <div className="relative p-3">
                            <video
                                className="aspect-video w-full rounded-xl border border-white/10 bg-slate-950 object-cover shadow-lg"
                                autoPlay
                                muted
                                playsInline
                                ref={setLocalVideoElement}
                            ></video>
                            {screenSharing && (
                                <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-500/15 px-2.5 py-1.5">
                                    <Monitor
                                        size={14}
                                        className="text-indigo-400"
                                    />
                                    <span className="text-xs font-medium text-indigo-300">
                                        Sharing your screen
                                    </span>
                                </div>
                            )}
                            {peerScreenSharing && (
                                <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-2.5 py-1.5">
                                    <Monitor
                                        size={14}
                                        className="text-amber-400"
                                    />
                                    <span className="text-xs font-medium text-amber-300">
                                        Peer is sharing screen
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
