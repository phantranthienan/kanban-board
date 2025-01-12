import { Router } from 'express';
import authRoutes from '@/routes/auth.routes';
import boardRoutes from '@/routes/board.routes';
import { authMiddleware } from '@/middleware/auth.middleware';

const router = Router();

/** Auth routes for user registration, login, and profile */
router.use('/auth', authRoutes);

/** Board routes, including nested section and task routes */
router.use('/boards', authMiddleware, boardRoutes);

export default router;
