import { Response, Request } from 'express';
import { catchAsync } from '../../helper/async-promise-handler';
import * as jwt from 'jsonwebtoken';
import { User } from '../../database/models/user.model';

export const secret = process.env.JWT_SECRET || 'WeWillRockYou';

export const authenticateUser = catchAsync(
    async (req: Request, res: Response) => {
        const token = jwt.sign({ userId: (req.user as User).id }, secret, {
            algorithm: 'HS256',
            expiresIn: '2d',
        });
        return res.status(200).json({ success: true, secret: token });
    }
);
