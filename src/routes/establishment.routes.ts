import { Router } from 'express';
import { 
  createEstablishment, 
  getEstablishments, 
  getEstablishment, 
  updateEstablishment, 
  deleteEstablishment
} from '../controllers/establishment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/establishments:
 *   get:
 *     summary: Obtener todos los establecimientos (público)
 *     tags: [Establishments]
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
 *         description: Número de establecimientos por página
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar solo establecimientos activos
 *       - in: query
 *         name: hasActivePromotions
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filtrar solo establecimientos con promociones activas y vigentes
 *     responses:
 *       200:
 *         description: Lista de establecimientos obtenida exitosamente
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
 *                     establishments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Establishment'
 *                     pagination:
 *                       type: object
 */
router.get('/', getEstablishments);

/**
 * @swagger
 * /api/establishments/{establishmentId}:
 *   get:
 *     summary: Obtener un establecimiento específico (público)
 *     tags: [Establishments]
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del establecimiento
 *       - in: query
 *         name: includePromotions
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir promociones del establecimiento
 *       - in: query
 *         name: onlyActivePromotions
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir solo promociones activas y vigentes
 *     responses:
 *       200:
 *         description: Establecimiento obtenido exitosamente
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
 *                     establishment:
 *                       $ref: '#/components/schemas/Establishment'
 *       404:
 *         description: Establecimiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:establishmentId', getEstablishment);

// Protected routes (require authentication)
router.use(authMiddleware);

/**
 * @swagger
 * /api/establishments:
 *   post:
 *     summary: Crear un nuevo establecimiento
 *     tags: [Establishments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del establecimiento
 *                 example: "Switch Bar"
 *               description:
 *                 type: string
 *                 description: Descripción del establecimiento
 *                 example: "Bar y restaurante cerca de la ESPE"
 *               address:
 *                 type: string
 *                 description: Dirección del establecimiento
 *                 example: "Av. Principal 123"
 *               phone:
 *                 type: string
 *                 description: Teléfono del establecimiento
 *                 example: "+593 99 999 9999"
 *               email:
 *                 type: string
 *                 description: Email del establecimiento
 *                 example: "contacto@switchbar.com"
 *               imageUrl:
 *                 type: string
 *                 description: URL de la imagen del establecimiento
 *                 example: "https://example.com/image.jpg"
 *               website:
 *                 type: string
 *                 description: Sitio web del establecimiento
 *                 example: "https://switchbar.com"
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo del establecimiento
 *                 example: true
 *     responses:
 *       201:
 *         description: Establecimiento creado exitosamente
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
 *                     establishment:
 *                       $ref: '#/components/schemas/Establishment'
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
router.post('/', createEstablishment);

/**
 * @swagger
 * /api/establishments/{establishmentId}:
 *   put:
 *     summary: Actualizar un establecimiento
 *     tags: [Establishments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del establecimiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre del establecimiento
 *               description:
 *                 type: string
 *                 description: Nueva descripción del establecimiento
 *               address:
 *                 type: string
 *                 description: Nueva dirección del establecimiento
 *               phone:
 *                 type: string
 *                 description: Nuevo teléfono del establecimiento
 *               email:
 *                 type: string
 *                 description: Nuevo email del establecimiento
 *               imageUrl:
 *                 type: string
 *                 description: Nueva URL de la imagen
 *               website:
 *                 type: string
 *                 description: Nuevo sitio web del establecimiento
 *               isActive:
 *                 type: boolean
 *                 description: Nuevo estado activo del establecimiento
 *     responses:
 *       200:
 *         description: Establecimiento actualizado exitosamente
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
 *                     establishment:
 *                       $ref: '#/components/schemas/Establishment'
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
 *         description: Establecimiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:establishmentId', updateEstablishment);

/**
 * @swagger
 * /api/establishments/{establishmentId}:
 *   delete:
 *     summary: Eliminar un establecimiento
 *     tags: [Establishments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: establishmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del establecimiento
 *     responses:
 *       200:
 *         description: Establecimiento eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Establecimiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:establishmentId', deleteEstablishment);

export default router;

