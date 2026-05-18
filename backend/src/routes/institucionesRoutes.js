/**
 * Rutas para Instituciones (CRUD Completo)
 * Permite crear, leer, actualizar y eliminar instituciones
 */
import express from 'express';
import * as institucionesController from '../controllers/institucionesController.js';

const router = express.Router();

/**
 * GET /api/instituciones/search?q=texto
 * Busca instituciones por nombre o dirección
 */
router.get('/search', institucionesController.search);

/**
 * GET /api/instituciones
 * Obtiene todas las instituciones activas
 */
router.get('/', institucionesController.getAll);

/**
 * GET /api/instituciones/:id
 * Obtiene una institución específica por ID
 */
router.get('/:id', institucionesController.getById);

/**
 * POST /api/instituciones
 * Crea una nueva institución
 */
router.post('/', institucionesController.create);

/**
 * PUT /api/instituciones/:id
 * Actualiza una institución existente
 */
router.put('/:id', institucionesController.update);

/**
 * DELETE /api/instituciones/:id
 * Eliminación lógica (marca como inactiva)
 */
router.delete('/:id', institucionesController.softDelete);

/**
 * DELETE /api/instituciones/:id/hard
 * Eliminación física permanente (usar con precaución)
 */
router.delete('/:id/hard', institucionesController.hardDelete);

export default router;
