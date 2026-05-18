import express from 'express'
import * as usuariosController from '../controllers/usuariosController.js'

const router = express.Router()

/**
 * GET /api/usuarios/search?q=término
 * Buscar usuarios por nombre, apellido o email
 */
router.get('/search', usuariosController.search)

/**
 * GET /api/usuarios/role/:roleId
 * Obtener usuarios por rol
 */
router.get('/role/:roleId', usuariosController.getByRole)

/**
 * GET /api/usuarios/institution/:institutionId
 * Obtener usuarios por institución
 */
router.get('/institution/:institutionId', usuariosController.getByInstitution)

/**
 * GET /api/usuarios
 * Obtener todos los usuarios activos
 */
router.get('/', usuariosController.getAll)

/**
 * GET /api/usuarios/:id
 * Obtener un usuario por ID
 */
router.get('/:id', usuariosController.getById)

/**
 * POST /api/usuarios
 * Crear un nuevo usuario
 */
router.post('/', usuariosController.create)

/**
 * PUT /api/usuarios/:id
 * Actualizar un usuario existente
 */
router.put('/:id', usuariosController.update)

/**
 * DELETE /api/usuarios/:id
 * Eliminación lógica (soft delete) de un usuario
 */
router.delete('/:id', usuariosController.softDelete)

/**
 * DELETE /api/usuarios/:id/hard
 * Eliminación física (hard delete) de un usuario
 */
router.delete('/:id/hard', usuariosController.hardDelete)

export default router
