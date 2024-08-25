import {
    AllowNull,
    AutoIncrement,
    Column,
    DataType,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript';
import { Conversation } from './conversation.model';
import { User } from './user.model';

@Table({
    timestamps: true,
    tableName: 'messages',
})
export class Message extends Model {
    @PrimaryKey
    @AutoIncrement
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

    @Column({
        type: DataType.STRING,
        allowNull: true,
        defaultValue: null,
    })
    reaction: string | null;

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
        type: DataType.BIGINT.UNSIGNED,
    })
    senderId: string;
}
