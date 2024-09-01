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
    Scopes,
} from 'sequelize-typescript';
import { getHashedPassword } from '../../helper/bcrypt-helpers';
import { Op } from 'sequelize';

@Scopes(() => ({
    withoutPassword: {
        attributes: { exclude: ['password'] },
    },
    withoutCurrentUser: (user: User) => ({
        where: {
            id: {
                [Op.ne]: user.id,
            },
        },
    }),
}))
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
