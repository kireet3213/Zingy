import { User } from '../models/user.model';
import { UserProfile } from '../models/userProfile.model';
import { users } from './users';

export const seedUsers = async () => {
    await User.bulkCreate(users, {
        include: {
            model: UserProfile,
            as: 'userProfile',
        },
    });
};
