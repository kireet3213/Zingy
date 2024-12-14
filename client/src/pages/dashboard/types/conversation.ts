import { Maybe } from '../../../types/utility';
import { Message } from '@shared-types/socket';

export type UserConversation = {
    id: string;
    senderName: string;
    unseenMessageCount: number;
    profileImageUrl: string;
    isConnected: boolean;
    socketId?: Maybe<string>;
    messages: Message[];
    self: boolean;
};
