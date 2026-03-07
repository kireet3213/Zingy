import {
    AllowNull,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript';
import { Conversation } from './conversation.model';
import { User } from './user.model';
import { MessageAttachment } from './messageAttachment.model';

@Table({
    timestamps: true,
    tableName: 'messages',
})
export class Message extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
    })
    id: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    message: string;

    @AllowNull
    @Column({
        type: DataType.DATE,
        defaultValue: null,
    })
    readAt: Date | null;

    @ForeignKey(() => Message)
    @AllowNull
    @Column({
        type: DataType.UUID,
        defaultValue: null,
    })
    replyId: string | null;

    @ForeignKey(() => Conversation)
    @AllowNull(false)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
    })
    conversationId: number;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
        type: DataType.UUID,
    })
    senderId: string;

    @BelongsTo(() => Message, {
        foreignKey: 'replyId',
        targetKey: 'id',
        as: 'replyTo',
    })
    replyTo: Message;

    @HasMany(() => MessageAttachment, {
        foreignKey: 'messageId',
        as: 'attachments',
    })
    attachments: MessageAttachment[];
}
