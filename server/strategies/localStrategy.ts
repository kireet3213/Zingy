import { Strategy } from 'passport-local';
import { User } from '../database/models/user.model';
import { comparePassword } from '../helper/bcrypt-helpers';
import { LoginUserDto } from '../controllers/auth/validation-dtos/login-user.dto';
import { validateOrRejectSchema } from '../helper/validate-schema';

export const localStrategy = new Strategy(
    { usernameField: 'email' },
    async (email: string, password: string, cb) => {
        try {
            const input = new LoginUserDto();
            input.email = email;
            input.password = password;
            await validateOrRejectSchema(input);

            const user = await User.findOne({
                where: {
                    email,
                },
                rejectOnEmpty: true,
            });

            const isValidPassword = await comparePassword(
                password,
                user.password
            );

            if (!user || !isValidPassword) {
                return cb(null, false, {
                    message: 'Incorrect email or password.',
                });
            }

            return cb(null, user);
        } catch (error) {
            return cb(error);
        }
    }
);
