/**
 * Rutas para Roles (Solo Lectura)
 * No incluye POST, PUT, DELETE ya que los roles se gestionan desde la DB
 */
import express from 'express';
import * as rolesController from '../controllers/rolesController.js';

const router = express.Router();

/**
 * GET /api/roles
 * Obtiene todos los roles activos
 */
router.get('/', rolesController.getAll);

/**
 * GET /api/roles/active
 * Obtiene solo roleId y name de roles activos (para dropdowns)
 */
router.get('/active', rolesController.getActive);

/**
 * GET /api/roles/:id
 * Obtiene un rol específico por ID
 */
router.get('/:id', rolesController.getById);

export default router;
