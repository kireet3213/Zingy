import { Message } from '@shared-types/socket';

export type UserConversation = {
    id: string;
    conversationId?: number;
    senderName: string;
    unseenMessageCount: number;
    profileImageUrl: string;
    isConnected: boolean;
    messages: Message[];
    self: boolean;
};
