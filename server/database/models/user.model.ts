import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
    BeforeCreate,
} from 'sequelize-typescript';
import { getHashedPassword } from '../../helper/bcrypt-helpers';

@Table({
    timestamps: true,
    tableName: 'users',
})
export class User extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string;

    @Unique
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password: string;

    @BeforeCreate
    static async beforeCreateHook(user: User) {
        const hashed = await getHashedPassword(user.password);
        user.password = hashed;
    }
}
