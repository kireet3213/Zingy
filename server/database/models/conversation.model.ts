import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
} from 'sequelize-typescript';

@Table({
    timestamps: true,
    tableName: 'conversations',
})
export class Conversation extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.BIGINT.UNSIGNED,
        allowNull: false,
    })
    id: number;

    @Unique
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string;
}
