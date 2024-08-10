import { Router } from 'express';
import { registerUser } from '../../controllers/user/user';

const userRoutes = Router();

userRoutes.post('/register', registerUser);
export default userRoutes;
