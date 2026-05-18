import supabase from '../config/supabase.js';

// ====================================================================
// CONTROLADOR DE EJEMPLO - Operaciones CRUD con Supabase
// ====================================================================
// Aquí defines la lógica de negocio que interactúa con Supabase
// Cada función maneja una operación (GET, POST, PUT, DELETE)
// ====================================================================

// GET: Obtener todos los registros de una tabla
export async function getAllItems(req, res) {
  try {
    const { data, error } = await supabase
      .from('tu_tabla') // 👈 Reemplaza con el nombre real de tu tabla
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error en getAllItems:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// GET: Obtener un registro por ID
export async function getItemById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tu_tabla')
      .select('*')
      .eq('id', id)
      .single(); // single() espera exactamente 1 resultado

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Registro no encontrado'
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error en getItemById:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// POST: Crear un nuevo registro
export async function createItem(req, res) {
  try {
    const newItem = req.body;

    const { data, error } = await supabase
      .from('tu_tabla')
      .insert([newItem])
      .select(); // select() devuelve el registro creado

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Registro creado exitosamente'
    });
  } catch (error) {
    console.error('Error en createItem:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// PUT: Actualizar un registro
export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('tu_tabla')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registro no encontrado'
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'Registro actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error en updateItem:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// DELETE: Eliminar un registro
export async function deleteItem(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tu_tabla')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Registro eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteItem:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
