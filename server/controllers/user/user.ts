import { RequestHandler } from 'express';
import { User } from '../../database/models/user.model';
import { RegisterUserDto } from './validation-dtos/register-user.dto';
import { validateOrRejectSchema } from '../../helper/validate-schema';
import * as express from 'express';
import { catchAsync } from '../../helper/async-promise-handler';

export const registerUser: RequestHandler = catchAsync(
    async (req: express.Request, res: express.Response) => {
        const registerUser = new RegisterUserDto();
        registerUser.email = req.body.email;
        registerUser.password = req.body.password;
        registerUser.name = req.body.name;
        await validateOrRejectSchema(registerUser);
        const user = await User.build().setAttributes(registerUser).save();
        return res
            .status(200)
            .json({ message: 'User registered successfully', data: user });
    }
);
