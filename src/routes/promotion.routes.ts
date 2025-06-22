import { Router } from 'express';
import { 
  createPromotion, 
  getPromotions, 
  getPromotion, 
  updatePromotion, 
  deletePromotion,
  getPromotionsByCategory 
} from '../controllers/promotion.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.get('/', getPromotions);
router.get('/category/:category', getPromotionsByCategory);
router.get('/:promotionId', getPromotion);

// Protected routes (require authentication)
router.use(authMiddleware);
router.post('/', createPromotion);
router.put('/:promotionId', updatePromotion);
router.delete('/:promotionId', deletePromotion);

export default router; 