import express from 'express'
import * as documentosController from '../controllers/documentosController.js'

const router = express.Router()

/**
 * GET /api/documentos/search?q=término
 * Buscar documentos por nombre o tipo
 */
router.get('/search', documentosController.search)

/**
 * GET /api/documentos/institution/:institutionId
 * Obtener documentos por institución
 */
router.get('/institution/:institutionId', documentosController.getByInstitution)

/**
 * GET /api/documentos/owner/:userId
 * Obtener documentos por propietario
 */
router.get('/owner/:userId', documentosController.getByOwner)

/**
 * GET /api/documentos/type/:type
 * Obtener documentos por tipo
 */
router.get('/type/:type', documentosController.getByType)

/**
 * GET /api/documentos
 * Obtener todos los documentos activos
 */
router.get('/', documentosController.getAll)

/**
 * GET /api/documentos/:id
 * Obtener un documento por ID
 */
router.get('/:id', documentosController.getById)

/**
 * POST /api/documentos
 * Crear un nuevo documento
 */
router.post('/', documentosController.create)

/**
 * PUT /api/documentos/:id
 * Actualizar un documento existente
 */
router.put('/:id', documentosController.update)

/**
 * DELETE /api/documentos/:id
 * Eliminación lógica (soft delete) de un documento
 */
router.delete('/:id', documentosController.softDelete)

/**
 * DELETE /api/documentos/:id/hard
 * Eliminación física (hard delete) de un documento
 */
router.delete('/:id/hard', documentosController.hardDelete)

export default router
