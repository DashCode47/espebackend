import { Router } from 'express';
import { getProfile, updateProfile, getPotentialMatches, getAllUsers } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/profile', getProfile);
router.get('/all-users', getAllUsers);
router.put('/profile', updateProfile);
router.get('/potential-matches', getPotentialMatches);

export default router; 