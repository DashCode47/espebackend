import { Router } from 'express';
import { likeUser, getMatches, checkMatch } from '../controllers/match.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/like/:targetUserId', likeUser);
router.get('/matches', getMatches);
router.get('/check/:targetUserId', checkMatch);

export default router; 