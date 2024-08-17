import { ConversationMessages } from '../types/messages';

export const conversationMessages: ConversationMessages = [
    {
        conversationId: 1,
        messages: [
            {
                id: 1,
                senderId: 2,
                text: 'Harkonnens are at our gates.',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                senderId: 2,
                text: 'Mine the spice on Arrakis',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 3,
                senderId: 1,
                text: 'Hear Hear.',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ],
    },
];
