import {
    Table,
    Model,
    Column,
    DataType,
    PrimaryKey,
    Unique,
    BeforeCreate,
    BeforeBulkCreate,
    Scopes,
    HasOne,
} from 'sequelize-typescript';
import { getHashedPassword } from '../../helper/bcrypt-helpers';
import { Op } from 'sequelize';
import { UserProfile } from './userProfile.model';

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
    withProfile: {
        include: [UserProfile],
    },
}))
@Table({
    timestamps: true,
    tableName: 'users',
})
export class User extends Model {
    @PrimaryKey
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

    @HasOne(() => UserProfile)
    userProfile: UserProfile;

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
