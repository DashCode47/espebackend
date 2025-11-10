"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const career_controller_1 = require("../controllers/career.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
/**
 * @swagger
 * components:
 *   schemas:
 *     Career:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - modality
 *         - duration
 *         - schedule
 *         - campus
 *         - cesResolution
 *         - directorName
 *         - directorEmail
 *         - accreditations
 *         - mission
 *         - vision
 *         - objectives
 *         - graduateProfile
 *         - professionalProfile
 *         - curriculumDescription
 *         - subjects
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único de la carrera
 *         code:
 *           type: string
 *           description: Código único de la carrera (ej. BIOTEC)
 *         name:
 *           type: string
 *           description: Nombre completo de la carrera
 *         modality:
 *           type: string
 *           enum: [Presencial, Semipresencial, Virtual]
 *           description: Modalidad de estudio
 *         duration:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           description: Duración en semestres
 *         schedule:
 *           type: string
 *           enum: [Matutina, Vespertina, Nocturna]
 *           description: Jornada de estudio
 *         campus:
 *           type: string
 *           description: Campus donde se imparte la carrera
 *         cesResolution:
 *           type: string
 *           description: Resolución del Consejo de Educación Superior
 *         directorName:
 *           type: string
 *           description: Nombre completo del director de carrera
 *         directorEmail:
 *           type: string
 *           format: email
 *           description: Correo electrónico del director
 *         accreditations:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de acreditaciones obtenidas
 *         mission:
 *           type: string
 *           description: Misión de la carrera
 *         vision:
 *           type: string
 *           description: Visión de la carrera
 *         objectives:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de objetivos de la carrera
 *         graduateProfile:
 *           type: string
 *           description: Perfil de egreso general
 *         professionalProfile:
 *           type: string
 *           description: Perfil de egreso profesional
 *         curriculumPdfUrl:
 *           type: string
 *           format: uri
 *           description: URL del PDF de la malla curricular
 *         curriculumDescription:
 *           type: string
 *           description: Descripción de la malla curricular
 *         subjects:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de asignaturas de la carrera
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Estado activo de la carrera
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */
/**
 * @swagger
 * /api/careers:
 *   post:
 *     summary: Crear una nueva carrera universitaria
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Career'
 *     responses:
 *       201:
 *         description: Carrera creada exitosamente
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
 *                     career:
 *                       $ref: '#/components/schemas/Career'
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
router.post('/', career_controller_1.createCareer);
/**
 * @swagger
 * /api/careers:
 *   get:
 *     summary: Obtener todas las carreras con filtros
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: modality
 *         schema:
 *           type: string
 *           enum: [Presencial, Semipresencial, Virtual]
 *         description: Filtrar por modalidad
 *       - in: query
 *         name: campus
 *         schema:
 *           type: string
 *         description: Filtrar por campus
 *       - in: query
 *         name: schedule
 *         schema:
 *           type: string
 *           enum: [Matutina, Vespertina, Nocturna]
 *         description: Filtrar por jornada
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
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
 *         description: Número de carreras por página
 *     responses:
 *       200:
 *         description: Lista de carreras obtenida exitosamente
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
 *                     careers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Career'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', career_controller_1.getCareers);
/**
 * @swagger
 * /api/careers/{careerId}:
 *   get:
 *     summary: Obtener una carrera por ID
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: careerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la carrera
 *     responses:
 *       200:
 *         description: Carrera obtenida exitosamente
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
 *                     career:
 *                       $ref: '#/components/schemas/Career'
 *       404:
 *         description: Carrera no encontrada
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
router.get('/:careerId', career_controller_1.getCareer);
/**
 * @swagger
 * /api/careers/code/{code}:
 *   get:
 *     summary: Obtener una carrera por código
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de la carrera (ej. BIOTEC)
 *     responses:
 *       200:
 *         description: Carrera obtenida exitosamente
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
 *                     career:
 *                       $ref: '#/components/schemas/Career'
 *       404:
 *         description: Carrera no encontrada
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
router.get('/code/:code', career_controller_1.getCareerByCode);
/**
 * @swagger
 * /api/careers/{careerId}:
 *   put:
 *     summary: Actualizar una carrera
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: careerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la carrera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Career'
 *     responses:
 *       200:
 *         description: Carrera actualizada exitosamente
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
 *                     career:
 *                       $ref: '#/components/schemas/Career'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Carrera no encontrada
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
router.put('/:careerId', career_controller_1.updateCareer);
/**
 * @swagger
 * /api/careers/{careerId}:
 *   delete:
 *     summary: Eliminar una carrera
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: careerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la carrera
 *     responses:
 *       200:
 *         description: Carrera eliminada exitosamente
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
 *                   example: Career deleted successfully
 *       404:
 *         description: Carrera no encontrada
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
router.delete('/:careerId', career_controller_1.deleteCareer);
/**
 * @swagger
 * /api/careers/campus/{campus}:
 *   get:
 *     summary: Obtener carreras por campus
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campus
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del campus
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
 *         description: Número de carreras por página
 *     responses:
 *       200:
 *         description: Lista de carreras del campus obtenida exitosamente
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
 *                     careers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Career'
 *                     campus:
 *                       type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/campus/:campus', career_controller_1.getCareersByCampus);
/**
 * @swagger
 * /api/careers/modality/{modality}:
 *   get:
 *     summary: Obtener carreras por modalidad
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: modality
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Presencial, Semipresencial, Virtual]
 *         description: Modalidad de estudio
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
 *         description: Número de carreras por página
 *     responses:
 *       200:
 *         description: Lista de carreras por modalidad obtenida exitosamente
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
 *                     careers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Career'
 *                     modality:
 *                       type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/modality/:modality', career_controller_1.getCareersByModality);
exports.default = router;
