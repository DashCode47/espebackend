import { Router } from 'express';
import { bannerController } from '../controllers/bannerController';

const router = Router();

// Create a new banner
router.post('/', bannerController.create);

// Get all banners
router.get('/', bannerController.getAll);

// Get a single banner by ID
router.get('/:id', bannerController.getById);

// Update a banner
router.put('/:id', bannerController.update);

// Delete a banner
router.delete('/:id', bannerController.delete);

export default router; 