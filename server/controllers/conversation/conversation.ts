import { RequestHandler } from 'express';
import * as express from 'express';
import { Op } from 'sequelize';
import { catchAsync } from '../../helper/async-promise-handler';
import {
    AuthorizationError,
    UnprocessableError,
} from '../../helper/error-helpers';
import { User } from '../../database/models/user.model';
import { Conversation } from '../../database/models/conversation.model';
import { ConversationUser } from '../../database/models/conversationUser.model';
import { Message } from '../../database/models/message.model';

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

export const getUserConversations: RequestHandler = catchAsync(
    async (req: express.Request, res: express.Response) => {
        const user = req.user as User | undefined;
        if (!user) {
            throw new AuthorizationError('Unauthorized', 401);
        }

        const memberships = await ConversationUser.findAll({
            where: { userId: user.id },
        });

        if (memberships.length === 0) {
            return res.status(200).json({ success: true, conversations: [] });
        }

        const conversationIds = memberships.map((m) => m.conversationId);

        const peerMemberships = await ConversationUser.findAll({
            where: {
                conversationId: { [Op.in]: conversationIds },
                userId: { [Op.ne]: user.id },
            },
        });

        const peerUserIds = [
            ...new Set(peerMemberships.map((m) => m.userId)),
        ];
        const peerUsers = await User.scope([
            'defaultScope',
            'withoutPassword',
        ]).findAll({
            where: { id: { [Op.in]: peerUserIds } },
        });
        const peerUserMap = new Map(peerUsers.map((u) => [u.id, u]));

        const lastMessages = await Promise.all(
            conversationIds.map(async (conversationId) => {
                const message = await Message.findOne({
                    where: { conversationId },
                    order: [['createdAt', 'DESC']],
                });
                return { conversationId, message };
            })
        );
        const lastMessageMap = new Map(
            lastMessages.map((m) => [m.conversationId, m.message])
        );

        const peerByConversation = new Map<string, typeof peerMemberships>();
        for (const pm of peerMemberships) {
            const key = String(pm.conversationId);
            const list = peerByConversation.get(key) ?? [];
            list.push(pm);
            peerByConversation.set(key, list);
        }

        const conversations = conversationIds.map((conversationId) => {
            const peers =
                peerByConversation.get(String(conversationId)) ?? [];
            const peerUser =
                peers.length > 0 ? peerUserMap.get(peers[0].userId) : null;
            const lastMessage = lastMessageMap.get(conversationId);

            return {
                conversationId,
                peer: peerUser
                    ? {
                          id: peerUser.id,
                          username: peerUser.username,
                          userProfile: peerUser.userProfile
                              ? {
                                    id: peerUser.userProfile.id,
                                    profileUrl:
                                        peerUser.userProfile.profileUrl,
                                    about: peerUser.userProfile.about,
                                }
                              : null,
                      }
                    : null,
                lastMessage: lastMessage
                    ? {
                          id: lastMessage.id,
                          text: lastMessage.message,
                          senderId: lastMessage.senderId,
                          createdAt: lastMessage.createdAt,
                      }
                    : null,
            };
        });

        return res.status(200).json({ success: true, conversations });
    }
);

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
