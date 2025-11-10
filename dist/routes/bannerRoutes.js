"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bannerController_1 = require("../controllers/bannerController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/banners:
 *   post:
 *     summary: Crear un nuevo banner
 *     tags: [Banners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - imageUrl
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del banner
 *               imageUrl:
 *                 type: string
 *                 description: URL de la imagen del banner
 *               link:
 *                 type: string
 *                 description: Enlace al que redirige el banner
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Estado activo del banner
 *     responses:
 *       201:
 *         description: Banner creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Banner'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', bannerController_1.bannerController.create);
/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Obtener todos los banners
 *     tags: [Banners]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar solo banners activos
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
 *         description: Número de banners por página
 *     responses:
 *       200:
 *         description: Lista de banners obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 banners:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Banner'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
router.get('/', bannerController_1.bannerController.getAll);
/**
 * @swagger
 * /api/banners/{id}:
 *   get:
 *     summary: Obtener un banner específico
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del banner
 *     responses:
 *       200:
 *         description: Banner obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Banner'
 *       404:
 *         description: Banner no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', bannerController_1.bannerController.getById);
/**
 * @swagger
 * /api/banners/{id}:
 *   put:
 *     summary: Actualizar un banner
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del banner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Nuevo título del banner
 *               imageUrl:
 *                 type: string
 *                 description: Nueva URL de la imagen
 *               link:
 *                 type: string
 *                 description: Nuevo enlace del banner
 *               isActive:
 *                 type: boolean
 *                 description: Nuevo estado activo del banner
 *     responses:
 *       200:
 *         description: Banner actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Banner'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Banner no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', bannerController_1.bannerController.update);
/**
 * @swagger
 * /api/banners/{id}:
 *   delete:
 *     summary: Eliminar un banner
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del banner
 *     responses:
 *       200:
 *         description: Banner eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Banner no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', bannerController_1.bannerController.delete);
exports.default = router;
