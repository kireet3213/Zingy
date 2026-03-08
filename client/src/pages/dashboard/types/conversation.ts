export type UserConversation = {
    id: string;
    conversationId?: number;
    senderName: string;
    profileImageUrl: string;
    isConnected: boolean;
    self: boolean;
};
