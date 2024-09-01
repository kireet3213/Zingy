import { RequestHandler } from 'express';
import { User } from '../../database/models/user.model';
import { RegisterUserDto } from './validation-dtos/register-user.dto';
import { validateOrRejectSchema } from '../../helper/validate-schema';
import * as express from 'express';
import { catchAsync } from '../../helper/async-promise-handler';
import { Op } from 'sequelize';

export const registerUser: RequestHandler = catchAsync(
    async (req: express.Request, res: express.Response) => {
        const registerUser = new RegisterUserDto();
        registerUser.email = req.body.email;
        registerUser.password = req.body.password;
        registerUser.username = req.body.username;
        await validateOrRejectSchema(registerUser);
        const user = await User.build().setAttributes(registerUser).save();
        return res
            .status(200)
            .json({ message: 'User registered successfully', data: user });
    }
);

export const searchUsers: RequestHandler = catchAsync(
    async (req: express.Request, res: express.Response) => {
        const keyword = req.query.keyword || '';
        const page =
            (typeof req.query.page === 'string' &&
                !!req.query.page &&
                Number.parseInt(req.query.page)) ||
            1;
        const perPage =
            (typeof req.query.perPage === 'string' &&
                !!req.query.perPage &&
                Number.parseInt(req.query.perPage)) ||
            20;
        const users = await User.scope([
            'withoutPassword',
            { method: ['withoutCurrentUser', req.user] },
        ]).findAll({
            limit: perPage,
            offset: perPage * (page - 1),
            where: {
                username: {
                    [Op.like]: `%${keyword}%`,
                },
            },
        });
        return res.status(200).json({ succes: true, users });
    }
);
