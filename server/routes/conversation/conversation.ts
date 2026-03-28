import { Router } from 'express';
import { verifyToken } from '../../middleware/verification.middleware';
import {
    getOrCreateDirectConversation,
    getUserConversations,
} from '../../controllers/conversation';

const conversationRoutes = Router();

conversationRoutes.get('/conversations', verifyToken, getUserConversations);

conversationRoutes.post(
    '/conversations/direct/:userId',
    verifyToken,
    getOrCreateDirectConversation
);

export default conversationRoutes;
