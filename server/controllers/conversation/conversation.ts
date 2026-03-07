import { RequestHandler } from 'express';
import * as express from 'express';
import { catchAsync } from '../../helper/async-promise-handler';
import {
    AuthorizationError,
    UnprocessableError,
} from '../../helper/error-helpers';
import { User } from '../../database/models/user.model';
import { Conversation } from '../../database/models/conversation.model';
import { ConversationUser } from '../../database/models/conversationUser.model';

function getSingleParam(
    value: string | string[] | undefined,
    key: string
): string {
    if (typeof value === 'string' && value.trim().length > 0) return value;
    throw new UnprocessableError(`${key} route parameter is required`);
}

function getDirectConversationName(userA: string, userB: string): string {
    const [first, second] = [userA, userB].sort();
    return `direct:${first}:${second}`;
}

export const getOrCreateDirectConversation: RequestHandler = catchAsync(
    async (req: express.Request, res: express.Response) => {
        const user = req.user as User | undefined;
        if (!user) {
            throw new AuthorizationError('Unauthorized', 401);
        }

        const targetUserId = getSingleParam(req.params.userId, 'userId');

        const targetUser = await User.findOne({
            where: {
                id: targetUserId,
            },
        });

        if (!targetUser) {
            throw new UnprocessableError('Target user does not exist');
        }

        const directConversationName = getDirectConversationName(
            user.id,
            targetUserId
        );
        const transaction = await Conversation.sequelize!.transaction();

        try {
            let conversation = await Conversation.findOne({
                where: {
                    name: directConversationName,
                },
                transaction,
            });

            if (!conversation) {
                conversation = await Conversation.create(
                    {
                        name: directConversationName,
                    },
                    { transaction }
                );
            }

            await ConversationUser.findOrCreate({
                where: {
                    conversationId: conversation.id,
                    userId: user.id,
                },
                defaults: {
                    conversationId: conversation.id,
                    userId: user.id,
                },
                transaction,
            });

            await ConversationUser.findOrCreate({
                where: {
                    conversationId: conversation.id,
                    userId: targetUserId,
                },
                defaults: {
                    conversationId: conversation.id,
                    userId: targetUserId,
                },
                transaction,
            });

            await transaction.commit();

            return res.status(200).json({
                success: true,
                conversationId: conversation.id,
                participants: [user.id, targetUserId],
            });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
);
