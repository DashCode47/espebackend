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

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Obtener todas las promociones (público)
 *     tags: [Promotions]
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
 *         description: Número de promociones por página
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar solo promociones activas
 *     responses:
 *       200:
 *         description: Lista de promociones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 promotions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Promotion'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
router.get('/', getPromotions);

/**
 * @swagger
 * /api/promotions/category/{category}:
 *   get:
 *     summary: Obtener promociones por categoría (público)
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Categoría de las promociones
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
 *         description: Número de promociones por página
 *     responses:
 *       200:
 *         description: Lista de promociones por categoría obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 promotions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Promotion'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/category/:category', getPromotionsByCategory);

/**
 * @swagger
 * /api/promotions/{promotionId}:
 *   get:
 *     summary: Obtener una promoción específica (público)
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: promotionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la promoción
 *     responses:
 *       200:
 *         description: Promoción obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       404:
 *         description: Promoción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:promotionId', getPromotion);

// Protected routes (require authentication)
router.use(authMiddleware);

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     summary: Crear una nueva promoción
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - startDate
 *               - endDate
 *               - location
 *               - isActive
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la promoción
 *                 example: "Switch"
 *               description:
 *                 type: string
 *                 description: Descripción de la promoción
 *                 example: "Disfruta de 2x1"
 *               category:
 *                 type: string
 *                 enum: [FOOD, DRINKS, EVENTS, PARTIES, OTHER]
 *                 description: Categoría de la promoción
 *                 example: "DRINKS"
 *               imageUrl:
 *                 type: string
 *                 description: URL de la imagen de la promoción
 *                 example: "https://dummyimage.com/600x400/32c7a7/fff"
 *               discount:
 *                 type: number
 *                 description: Porcentaje de descuento
 *                 example: 0
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de inicio de la promoción
 *                 example: "2025-07-01T01:17:15.549Z"
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de expiración de la promoción
 *                 example: "2025-07-01T01:17:15.549Z"
 *               endDate: 
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de fin de la promoción
 *                 example: "2025-07-01T01:17:15.549Z"
 *               location:
 *                 type: string
 *                 description: Ubicación de la promoción
 *                 example: "Switch"
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo de la promoción
 *                 example: true
 *     responses:
 *       201:
 *         description: Promoción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     promotion:
 *                       $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Datos inválidos
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
 */
router.post('/', createPromotion);

/**
 * @swagger
 * /api/promotions/{promotionId}:
 *   put:
 *     summary: Actualizar una promoción
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la promoción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Nuevo título de la promoción
 *               description:
 *                 type: string
 *                 description: Nueva descripción de la promoción
 *               category:
 *                 type: string
 *                 description: Nueva categoría de la promoción
 *               imageUrl:
 *                 type: string
 *                 description: Nueva URL de la imagen
 *               discount:
 *                 type: number
 *                 description: Nuevo porcentaje de descuento
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha de expiración
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha de expiración
 *               location:
 *                 type: string
 *                 description: Nueva ubicación de la promoción
 *               isActive:
 *                 type: boolean
 *                 description: Nuevo estado activo de la promoción
 *                 example: true
 *     responses:
 *       200:
 *         description: Promoción actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Datos inválidos
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
 *         description: Promoción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:promotionId', updatePromotion);

/**
 * @swagger
 * /api/promotions/{promotionId}:
 *   delete:
 *     summary: Eliminar una promoción
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la promoción
 *     responses:
 *       200:
 *         description: Promoción eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Promoción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:promotionId', deletePromotion);

export default router; 