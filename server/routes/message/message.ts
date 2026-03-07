import { Router } from 'express';
import {
    createMessage,
    getConversationMessages,
} from '../../controllers/message';
import { verifyToken } from '../../middleware/verification.middleware';

const messageRoutes = Router();

messageRoutes.post(
    '/conversations/:conversationId/messages',
    verifyToken,
    createMessage
);
messageRoutes.get(
    '/conversations/:conversationId/messages',
    verifyToken,
    getConversationMessages
);

export default messageRoutes;
