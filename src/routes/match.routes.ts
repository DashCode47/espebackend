import { Router } from 'express';
import { likeUser, getMatches, checkMatch } from '../controllers/match.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/matches/like/{targetUserId}:
 *   post:
 *     summary: Dar like a un usuario
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario al que se le da like
 *     responses:
 *       200:
 *         description: Like registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 isMatch:
 *                   type: boolean
 *                   description: Indica si se formó un match
 *       400:
 *         description: No se puede dar like a sí mismo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario objetivo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/like/:targetUserId', likeUser);

/**
 * @swagger
 * /api/matches/matches:
 *   get:
 *     summary: Obtener todos los matches del usuario
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de matches por página
 *     responses:
 *       200:
 *         description: Lista de matches obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/matches', getMatches);

/**
 * @swagger
 * /api/matches/check/{targetUserId}:
 *   get:
 *     summary: Verificar si hay match con un usuario específico
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a verificar
 *     responses:
 *       200:
 *         description: Estado del match verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasMatch:
 *                   type: boolean
 *                   description: Indica si hay match
 *                 status:
 *                   type: string
 *                   enum: [none, liked, matched]
 *                   description: Estado de la relación
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/check/:targetUserId', checkMatch);

export default router; 