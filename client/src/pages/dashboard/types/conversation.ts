export type Conversation = {
    id: number;
    senderName: string;
    lastMessage: string;
    unseenMessageCount: number;
    latestMessageTimestamp: Date;
    profileImageUrl: string;
    senderId: number;
};
