export type ServerToClientEvents = {
    ping: (data: string) => void;
};

export type ClientToServerEvents = {
    message: (
        data: {
            createdAt: Date;
            updatedAt: Date;
            senderId: string;
            text: string;
        },
        acknowledgementCallback: AcknowledgementCallback
    ) => void;
};

export type AcknowledgementCallback = (
    error: unknown,
    acknowlegementResponse: unknown
) => void;
