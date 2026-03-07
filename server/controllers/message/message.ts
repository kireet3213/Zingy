import { RequestHandler } from 'express';
import * as express from 'express';
import { Op } from 'sequelize';
import { catchAsync } from '../../helper/async-promise-handler';
import {
    UnprocessableError,
    AuthorizationError,
} from '../../helper/error-helpers';
import { ConversationUser } from '../../database/models/conversationUser.model';
import { Message } from '../../database/models/message.model';
import { User } from '../../database/models/user.model';
import { MessageAttachment } from '../../database/models/messageAttachment.model';

type AttachmentInput = {
    fileUrl: string;
    fileName: string;
    mimeType?: string | null;
    sizeBytes?: number | null;
};

type MessageResponse = {
    id: string;
    text: string;
    conversationId: number;
    sender: {
        id: string;
        username: string;
    };
    replyTo: {
        id: string;
        text: string;
        senderId: string;
        createdAt: Date;
    } | null;
    attachments: Array<{
        id: string;
        fileUrl: string;
        fileName: string;
        mimeType: string | null;
        sizeBytes: number | null;
        createdAt: Date;
    }>;
    readAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

function parseConversationId(conversationIdParam: string): number {
    const conversationId = Number.parseInt(conversationIdParam, 10);
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
        throw new UnprocessableError(
            'conversationId must be a valid positive integer'
        );
    }
    return conversationId;
}

function getSingleParam(
    value: string | string[] | undefined,
    key: string
): string {
    if (typeof value === 'string') return value;
    throw new UnprocessableError(`${key} route parameter is required`);
}

function parsePagination(
    value: unknown,
    fallback: number,
    max: number
): number {
    if (typeof value !== 'string') return fallback;
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
    return Math.min(parsed, max);
}

async function assertConversationMembership(
    userId: string,
    conversationId: number
) {
    const count = await ConversationUser.count({
        where: {
            userId,
            conversationId,
        },
    });
    if (count === 0) {
        throw new AuthorizationError(
            'You are not a member of this conversation',
            403
        );
    }
}

function normalizeAttachments(rawAttachments: unknown): AttachmentInput[] {
    if (rawAttachments == null) return [];
    if (!Array.isArray(rawAttachments)) {
        throw new UnprocessableError('attachments must be an array');
    }
    if (rawAttachments.length > 10) {
        throw new UnprocessableError('attachments cannot exceed 10 items');
    }
    return rawAttachments.map((attachment, index) => {
        if (!attachment || typeof attachment !== 'object') {
            throw new UnprocessableError(
                `attachments[${index}] must be a valid object`
            );
        }
        const input = attachment as Record<string, unknown>;
        if (
            typeof input.fileUrl !== 'string' ||
            input.fileUrl.trim().length === 0 ||
            typeof input.fileName !== 'string' ||
            input.fileName.trim().length === 0
        ) {
            throw new UnprocessableError(
                `attachments[${index}] must include fileUrl and fileName`
            );
        }

        let sizeBytes: number | null = null;
        if (input.sizeBytes !== undefined && input.sizeBytes !== null) {
            if (
                typeof input.sizeBytes !== 'number' ||
                !Number.isFinite(input.sizeBytes) ||
                input.sizeBytes < 0
            ) {
                throw new UnprocessableError(
                    `attachments[${index}].sizeBytes must be a non-negative number`
                );
            }
            sizeBytes = Math.trunc(input.sizeBytes);
        }

        let mimeType: string | null = null;
        if (input.mimeType !== undefined && input.mimeType !== null) {
            if (typeof input.mimeType !== 'string') {
                throw new UnprocessableError(
                    `attachments[${index}].mimeType must be a string`
                );
            }
            mimeType = input.mimeType;
        }

        return {
            fileUrl: input.fileUrl.trim(),
            fileName: input.fileName.trim(),
            mimeType,
            sizeBytes,
        };
    });
}

async function formatMessages(messages: Message[]): Promise<MessageResponse[]> {
    if (messages.length === 0) return [];

    const messageIds = messages.map((message) => message.id);
    const senderIds = [...new Set(messages.map((message) => message.senderId))];
    const replyIds = [
        ...new Set(
            messages
                .map((message) => message.replyId)
                .filter((replyId): replyId is string => Boolean(replyId))
        ),
    ];

    const [attachments, senders, repliedMessages] = await Promise.all([
        MessageAttachment.findAll({
            where: {
                messageId: {
                    [Op.in]: messageIds,
                },
            },
            order: [['createdAt', 'ASC']],
        }),
        User.scope(['withoutPassword']).findAll({
            where: {
                id: {
                    [Op.in]: senderIds,
                },
            },
        }),
        replyIds.length
            ? Message.findAll({
                  where: {
                      id: {
                          [Op.in]: replyIds,
                      },
                  },
              })
            : Promise.resolve([]),
    ]);

    const attachmentMap = new Map<string, MessageAttachment[]>();
    for (const attachment of attachments) {
        const previous = attachmentMap.get(attachment.messageId) ?? [];
        previous.push(attachment);
        attachmentMap.set(attachment.messageId, previous);
    }

    const senderMap = new Map<string, User>();
    for (const sender of senders) {
        senderMap.set(sender.id, sender);
    }

    const repliedMessageMap = new Map<string, Message>();
    for (const repliedMessage of repliedMessages) {
        repliedMessageMap.set(repliedMessage.id, repliedMessage);
    }

    return messages.map((message) => {
        const sender = senderMap.get(message.senderId);
        const replyToMessage = message.replyId
            ? repliedMessageMap.get(message.replyId)
            : null;
        return {
            id: message.id,
            text: message.message,
            conversationId: message.conversationId,
            sender: {
                id: message.senderId,
                username: sender?.username ?? '',
            },
            replyTo: replyToMessage
                ? {
                      id: replyToMessage.id,
                      text: replyToMessage.message,
                      senderId: replyToMessage.senderId,
                      createdAt: replyToMessage.createdAt,
                  }
                : null,
            attachments: (attachmentMap.get(message.id) ?? []).map(
                (attachment) => ({
                    id: attachment.id,
                    fileUrl: attachment.fileUrl,
                    fileName: attachment.fileName,
                    mimeType: attachment.mimeType,
                    sizeBytes: attachment.sizeBytes,
                    createdAt: attachment.createdAt,
                })
            ),
            readAt: message.readAt,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
        };
    });
}

export const createMessage: RequestHandler = catchAsync(
    async (req: express.Request, res: express.Response) => {
        const user = req.user as User | undefined;
        if (!user) {
            throw new AuthorizationError('Unauthorized', 401);
        }

        const conversationId = parseConversationId(
            getSingleParam(req.params.conversationId, 'conversationId')
        );
        await assertConversationMembership(user.id, conversationId);

        const text =
            typeof req.body.text === 'string' ? req.body.text.trim() : '';
        const attachments = normalizeAttachments(req.body.attachments);
        const replyId =
            typeof req.body.replyId === 'string' &&
            req.body.replyId.trim().length > 0
                ? req.body.replyId.trim()
                : null;

        if (text.length === 0 && attachments.length === 0) {
            throw new UnprocessableError(
                'Either text or at least one attachment is required'
            );
        }

        if (replyId) {
            const replyMessage = await Message.findOne({
                where: {
                    id: replyId,
                    conversationId,
                },
            });
            if (!replyMessage) {
                throw new UnprocessableError(
                    'replyId must belong to a message in the same conversation'
                );
            }
        }

        const transaction = await Message.sequelize!.transaction();
        try {
            const message = await Message.create(
                {
                    message: text,
                    conversationId,
                    senderId: user.id,
                    replyId,
                },
                { transaction }
            );

            if (attachments.length > 0) {
                await MessageAttachment.bulkCreate(
                    attachments.map((attachment) => ({
                        ...attachment,
                        messageId: message.id,
                    })),
                    {
                        transaction,
                    }
                );
            }

            await transaction.commit();

            const payload = await formatMessages([message]);
            return res.status(201).json({
                success: true,
                message: payload[0],
            });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
);

export const getConversationMessages: RequestHandler = catchAsync(
    async (req: express.Request, res: express.Response) => {
        const user = req.user as User | undefined;
        if (!user) {
            throw new AuthorizationError('Unauthorized', 401);
        }

        const conversationId = parseConversationId(
            getSingleParam(req.params.conversationId, 'conversationId')
        );
        await assertConversationMembership(user.id, conversationId);

        const page = parsePagination(req.query.page, 1, 100000);
        const perPage = parsePagination(req.query.perPage, 20, 100);
        const offset = (page - 1) * perPage;

        const { rows: messages, count } = await Message.findAndCountAll({
            where: {
                conversationId,
            },
            order: [['createdAt', 'ASC']],
            limit: perPage,
            offset,
        });

        const payload = await formatMessages(messages);

        return res.status(200).json({
            success: true,
            page,
            perPage,
            total: count,
            messages: payload,
        });
    }
);
