import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Conversation } from './conversation.model';

@Table({
    timestamps: true,
    tableName: 'conversation_users',
    underscored: false,
})
export class ConversationUser extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    id: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId: string;

    @ForeignKey(() => Conversation)
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    conversationId: number;
}
