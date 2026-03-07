import {
    AllowNull,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript';
import { Message } from './message.model';

@Table({
    timestamps: true,
    tableName: 'message_attachments',
})
export class MessageAttachment extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
    })
    id: string;

    @ForeignKey(() => Message)
    @AllowNull(false)
    @Column({
        type: DataType.UUID,
    })
    messageId: string;

    @AllowNull(false)
    @Column({
        type: DataType.TEXT,
    })
    fileUrl: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(255),
    })
    fileName: string;

    @AllowNull
    @Column({
        type: DataType.STRING(255),
        defaultValue: null,
    })
    mimeType: string | null;

    @AllowNull
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        defaultValue: null,
    })
    sizeBytes: number | null;

    @BelongsTo(() => Message, { foreignKey: 'messageId', targetKey: 'id' })
    message: Message;
}
