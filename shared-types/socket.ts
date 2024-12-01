export type User = {
    createdAt: string;
    email: string;
    id: string;
    username: string;
    updatedAt: string;
    userProfile: UserProfile
};

export type UserProfile = {
    about: string;
    createdAt: string;
    id: string;
    profileUrl: string;
    updatedAt: string;
    userId: string;
}
export type Message = {
    id: string;
    createdAt: string;
    updatedAt: string;
    fromSelf: boolean;
    text: string;
    to: string | null;
}

export type ServerToClientEvents = {
    ping: (data: string) => void;
    "connected-users": (data: { id: string; user: User, isConnected: boolean }[]) => void;
    'private-message': (data: { message: Message; from: string, to: string }) => void;
    'new-user-connected': (data: { id: string; user: User }) => void;
    "user-disconnected": (data: string) => void;
};

export type ClientToServerEvents = {
    'private-message': (
        data: Message,
        acknowledgementCallback: AcknowledgementCallback
    ) => void;
};

export type AcknowledgementCallback = (
    error: unknown,
    acknowlegementResponse: unknown
) => void;
