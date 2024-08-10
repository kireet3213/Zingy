import { Router } from 'express';
import passport from 'passport';
import { authenticateUser } from '../../controllers/auth/auth';

const authRoutes = Router();

authRoutes.post(
    '/login',
    passport.authenticate('local', { failureMessage: true, session: false }),
    authenticateUser
);

export default authRoutes;
