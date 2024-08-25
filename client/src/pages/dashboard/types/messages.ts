export type Message = {
    id: string;
    senderId: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
};

export type ConversationMessage = {
    conversationId: number;
    messages: Message[];
};

// Define the Conversation interface
export type ConversationMessages = Array<ConversationMessage>;
