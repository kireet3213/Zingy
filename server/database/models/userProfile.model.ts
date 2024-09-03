import {
    AllowNull,
    Column,
    DataType,
    Default,
    ForeignKey,
    PrimaryKey,
    Table,
    Model,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({
    timestamps: true,
    tableName: 'user_profile',
})
export class UserProfile extends Model {
    @PrimaryKey
    @Column({
        type: DataType.UUIDV4,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
    })
    id: string;

    @Default(null)
    @AllowNull
    @Column({
        type: DataType.STRING,
    })
    profileUrl: string | null;

    @Default(null)
    @AllowNull
    @Column({
        type: DataType.STRING,
    })
    about: string | null;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column({
        type: DataType.STRING,
    })
    userId: string;
}
