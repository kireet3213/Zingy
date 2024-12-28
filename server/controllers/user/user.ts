import { RequestHandler } from 'express';
import { User } from '../../database/models/user.model';
import { RegisterUserDto } from './validation-dtos/register-user.dto';
import { validateOrRejectSchema } from '../../helper/validate-schema';
import * as express from 'express';
import { catchAsync } from '../../helper/async-promise-handler';
import { Op } from 'sequelize';
import { UserProfile } from '../../database/models/userProfile.model';
import { SearchUsersDto } from './validation-dtos/search-users.dto';

export const registerUser: RequestHandler = catchAsync(
    async (req: express.Request, res: express.Response) => {
        const registerUser = new RegisterUserDto();
        registerUser.email = req.body.email;
        registerUser.password = req.body.password;
        registerUser.username = req.body.username;
        await validateOrRejectSchema(registerUser);
        const user = await User.build().setAttributes(registerUser).save();
        await UserProfile.build().setAttributes({ userId: user.id }).save();
        return res
            .status(200)
            .json({ message: 'User registered successfully', data: user });
    }
);

export const searchUsers: RequestHandler = catchAsync(
    async (req: express.Request, res: express.Response) => {
        const { keyword, page, perPage } = req.query;
        const validateParams = new SearchUsersDto();
        validateParams.page = page as string;
        validateParams.perPage = perPage as string;
        validateParams.keyword = keyword as string;
        await validateOrRejectSchema(validateParams);
        const offsetPage =
            (typeof page === 'string' && !!page && Number.parseInt(page)) || 1;
        const limit =
            (typeof perPage === 'string' &&
                !!perPage &&
                Number.parseInt(perPage)) ||
            20;
        const users = await User.scope([
            'defaultScope',
            'withoutPassword',
        ]).findAll({
            limit,
            offset: limit * (offsetPage - 1),
            where: {
                username: {
                    [Op.like]: `%${keyword}%`,
                },
            },
        });
        return res.status(200).json({ success: true, users });
    }
);
