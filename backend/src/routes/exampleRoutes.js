import express from 'express';
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/exampleController.js';

const router = express.Router();

// ====================================================================
// RUTAS DE EJEMPLO - API RESTful
// ====================================================================
// Define los endpoints que tu frontend puede consumir
// Cada ruta llama a un controlador que maneja la lógica
// ====================================================================

// GET /api/items - Obtener todos los registros
router.get('/', getAllItems);

// GET /api/items/:id - Obtener un registro específico
router.get('/:id', getItemById);

// POST /api/items - Crear nuevo registro
router.post('/', createItem);

// PUT /api/items/:id - Actualizar registro
router.put('/:id', updateItem);

// DELETE /api/items/:id - Eliminar registro
router.delete('/:id', deleteItem);

export default router;
