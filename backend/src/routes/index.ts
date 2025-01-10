import { Router } from 'express';
import authRoutes from './auth.routes';
import boardRoutes from './board.routes';

const router = Router();

/** Auth routes for user registration, login, and profile */
router.use('/auth', authRoutes);

/** Board routes, including nested section and task routes */
router.use('/boards', boardRoutes);

export default router;
