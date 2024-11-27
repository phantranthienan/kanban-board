import { Router } from 'express';
import authRoutes from './authRoutes';
import boardRoutes from './boardRoutes';

const router = Router();

/** Auth routes for user registration, login, and profile */
router.use('/auth', authRoutes);

/** Board routes, including nested section and task routes */
router.use('/boards', boardRoutes);

export default router;
