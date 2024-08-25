import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
    BeforeCreate,
    BeforeBulkCreate,
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
        type: DataType.UUIDV4,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
    })
    id: string;

    @Unique
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    username: string;

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

    @BeforeBulkCreate
    static async beforeBulkCreateHook(users: User[]) {
        for (const user of users) {
            const hashed = await getHashedPassword(user.password);
            user.password = hashed;
        }
    }
}
