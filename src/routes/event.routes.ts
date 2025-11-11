import { Router } from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  attendEvent,
  cancelAttendance,
  getEventAttendees
} from '../controllers/event.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadSingle } from '../middlewares/upload';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Listar todos los eventos con filtros opcionales
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [SOCIAL, ACADEMIC, PRIVATE, SPORTS, OTHER]
 *         description: Filtrar por categoría
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar eventos desde esta fecha
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar eventos hasta esta fecha
 *       - in: query
 *         name: ubicacion
 *         schema:
 *           type: string
 *         description: Filtrar por ubicación (búsqueda parcial)
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
 *         description: Número de eventos por página
 *     responses:
 *       200:
 *         description: Lista de eventos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Parámetros de filtro inválidos
 *       401:
 *         description: No autorizado
 */
router.get('/', getEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Obtener detalles de un evento específico
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       404:
 *         description: Evento no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', getEvent);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Crear un nuevo evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - categoria
 *               - fechaInicio
 *               - ubicacion
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del evento
 *               descripcion:
 *                 type: string
 *                 description: Descripción del evento
 *               categoria:
 *                 type: string
 *                 enum: [SOCIAL, ACADEMIC, PRIVATE, SPORTS, OTHER]
 *                 description: Categoría del evento
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de inicio (ISO 8601)
 *               fechaFin:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de fin (opcional, ISO 8601)
 *               ubicacion:
 *                 type: string
 *                 description: Ubicación del evento
 *               precio:
 *                 type: number
 *                 default: 0
 *                 description: Precio del evento
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del evento (opcional)
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Event created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', uploadSingle, createEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Editar un evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del evento
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               categoria:
 *                 type: string
 *                 enum: [SOCIAL, ACADEMIC, PRIVATE, SPORTS, OTHER]
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *               fechaFin:
 *                 type: string
 *                 format: date-time
 *               ubicacion:
 *                 type: string
 *               precio:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Evento actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Event updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para editar este evento
 *       404:
 *         description: Evento no encontrado
 */
router.put('/:id', uploadSingle, updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Eliminar un evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Event deleted successfully
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para eliminar este evento
 *       404:
 *         description: Evento no encontrado
 */
router.delete('/:id', deleteEvent);

/**
 * @swagger
 * /api/events/{id}/attend:
 *   post:
 *     summary: Confirmar asistencia a un evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del evento
 *     responses:
 *       201:
 *         description: Asistencia confirmada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Attendance confirmed successfully
 *       400:
 *         description: Ya estás asistiendo a este evento
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Evento no encontrado
 */
router.post('/:id/attend', attendEvent);

/**
 * @swagger
 * /api/events/{id}/attend:
 *   delete:
 *     summary: Cancelar asistencia a un evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Asistencia cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Attendance cancelled successfully
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Evento no encontrado o no estás asistiendo a este evento
 */
router.delete('/:id/attend', cancelAttendance);

/**
 * @swagger
 * /api/events/{id}/attendees:
 *   get:
 *     summary: Listar asistentes de un evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del evento
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
 *         description: Número de asistentes por página
 *     responses:
 *       200:
 *         description: Lista de asistentes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     attendees:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           avatarUrl:
 *                             type: string
 *                             nullable: true
 *                           career:
 *                             type: string
 *                           attendedAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Evento no encontrado
 */
router.get('/:id/attendees', getEventAttendees);

export default router;

