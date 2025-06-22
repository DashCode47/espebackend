import { Router } from 'express';
import { createPost, getPosts, getPost, updatePost, reactToPost } from '../controllers/post.controller';
import { createComment, getPostComments } from '../controllers/comment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Post CRUD routes
router.post('/', createPost);
router.get('/', getPosts);
router.get('/:postId', getPost);
router.put('/:postId', updatePost);

// Post reactions
router.post('/:postId/react', reactToPost);

// Comment routes
router.post('/:postId/comments', createComment);
router.get('/:postId/comments', getPostComments);

export default router; 