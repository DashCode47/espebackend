"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trip_controller_1 = require("../controllers/trip.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Trip:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         driverId:
 *           type: string
 *         origin:
 *           type: string
 *         destination:
 *           type: string
 *         departureTime:
 *           type: string
 *           format: date-time
 *         availableSeats:
 *           type: integer
 *         price:
 *           type: number
 *         notes:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, FULL, CANCELLED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TripRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         tripId:
 *           type: string
 *         passengerId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *         createdAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Listar viajes activos con filtros opcionales
 *     tags: [Trips]
 *     parameters:
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *         description: Filtrar por origen
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filtrar por destino
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha
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
 *           default: 20
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de viajes obtenida exitosamente
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
 *                     trips:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Trip'
 *                     pagination:
 *                       type: object
 */
router.get('/', trip_controller_1.getTrips);
/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Obtener detalle de un viaje
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del viaje
 *     responses:
 *       200:
 *         description: Detalle del viaje obtenido exitosamente
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
 *                     trip:
 *                       $ref: '#/components/schemas/Trip'
 *       404:
 *         description: Viaje no encontrado
 */
router.get('/:id', trip_controller_1.getTripById);
/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Crear un nuevo viaje (solo DRIVER)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - departureTime
 *               - availableSeats
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *               availableSeats:
 *                 type: integer
 *               price:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Viaje creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Solo conductores pueden crear viajes
 */
router.post('/', auth_middleware_1.authMiddleware, (0, role_middleware_1.requireRole)(role_middleware_1.UserRole.STUDENT, role_middleware_1.UserRole.DRIVER), trip_controller_1.createTrip);
/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Actualizar un viaje (solo creador)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *               availableSeats:
 *                 type: integer
 *               price:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Viaje actualizado exitosamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Viaje no encontrado
 */
router.put('/:id', auth_middleware_1.authMiddleware, trip_controller_1.updateTrip);
/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Cancelar un viaje (solo creador)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Viaje cancelado exitosamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Viaje no encontrado
 */
router.delete('/:id', auth_middleware_1.authMiddleware, trip_controller_1.cancelTrip);
/**
 * @swagger
 * /api/trips/{id}/join:
 *   post:
 *     summary: Unirse a un viaje (crear solicitud)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *       400:
 *         description: Viaje no disponible
 *       409:
 *         description: Ya existe una solicitud para este viaje
 */
router.post('/:id/join', auth_middleware_1.authMiddleware, trip_controller_1.joinTrip);
/**
 * @swagger
 * /api/trips/{id}/confirm:
 *   post:
 *     summary: Conductor acepta un pasajero
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *             properties:
 *               requestId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pasajero confirmado exitosamente
 *       400:
 *         description: Viaje lleno o solicitud inválida
 *       403:
 *         description: Solo el conductor puede confirmar pasajeros
 */
router.post('/:id/confirm', auth_middleware_1.authMiddleware, (0, role_middleware_1.requireRole)(role_middleware_1.UserRole.DRIVER, role_middleware_1.UserRole.STUDENT), trip_controller_1.confirmPassenger);
/**
 * @swagger
 * /api/trips/{id}/rating:
 *   post:
 *     summary: Calificar al conductor de un viaje
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Calificación creada exitosamente
 *       403:
 *         description: Solo puedes calificar viajes en los que participaste
 *       409:
 *         description: Ya calificaste este viaje
 */
router.post('/:id/rating', auth_middleware_1.authMiddleware, trip_controller_1.rateDriver);
exports.default = router;
