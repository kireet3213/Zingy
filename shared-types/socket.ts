export type User = {
    createdAt: string;
    email: string;
    id: string;
    username: string;
    updatedAt: string;
    userProfile: UserProfile;
};

export type UserProfile = {
    about: string;
    createdAt: string;
    id: string;
    profileUrl: string;
    updatedAt: string;
    userId: string;
};
export type Message = {
    id: string;
    createdAt: string;
    updatedAt: string;
    fromSelf: boolean;
    text: string;
    to: string | null;
};
export type UserConversation = {
    id: string;
    conversationId?: number;
    senderName: string;
    profileImageUrl: string;
    isConnected?: boolean;
    self: boolean;
};

export type ServerToClientEvents = {
    ping: (data: string) => void;
    'connected-users': (
        data: { id: string; user: User; isConnected: boolean }[]
    ) => void;
    'private-message': (data: {
        message: Message;
        from: string;
        to: string;
        fromUser: User | null;
    }) => void;
    'new-user-connected': (data: { id: string; user: User }) => void;
    'user-disconnected': (data: string) => void;
    'video-offer': VideoOffer;
    'video-answer': VideoAnswer;
    "new-ice-candidate": NewIceCandidateClient;
    'video-hangup': VideoHangup;
};

export type ClientToServerEvents = {
    'private-message': (
        data: Message,
        acknowledgementCallback: AcknowledgementCallback
    ) => void;
    'video-call': VideoCallFunction;
    'video-answer': VideoAnswer;
    'new-ice-candidate': NewIceCandidateClient;
    'video-hangup': VideoHangup;
};

export type AcknowledgementCallback = (
    error: unknown,
    acknowlegementResponse: unknown
) => void;

type VideoCallFunction = (
    data: {
        sdp: RTCSessionDescription;
        peer: UserConversation;
    },
    acknowledgementCallback: AcknowledgementCallback
) => void;

export type VideoOffer = (
    data: {
        sdp: RTCSessionDescriptionInit;
        peer: User;
    }
    // acknowledgementCallback: AcknowledgementCallback
) => void;

export type VideoAnswer = (data: {
    sdp: RTCSessionDescription;
    peer: User;
}) => void;

type NewIceCandidateClient = (data: {
    candidate: RTCIceCandidateInit;
    peerId: string;
}) => void;

type VideoHangup = (data: {
    peerId: string;
}) => void;
