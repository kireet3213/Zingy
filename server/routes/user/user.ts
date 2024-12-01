import { Router } from 'express';
import { searchUsers, registerUser } from '../../controllers/user';
import { verifyToken } from '../../middleware/verification.middleware';
registerUser;

const userRoutes = Router();

userRoutes.post('/register', registerUser);
userRoutes.get('/search-users', verifyToken, searchUsers);

export default userRoutes;
