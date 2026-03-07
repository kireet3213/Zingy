import { Router } from 'express';
import { verifyToken } from '../../middleware/verification.middleware';
import { getOrCreateDirectConversation } from '../../controllers/conversation';

const conversationRoutes = Router();

conversationRoutes.post(
    '/conversations/direct/:userId',
    verifyToken,
    getOrCreateDirectConversation
);

export default conversationRoutes;
