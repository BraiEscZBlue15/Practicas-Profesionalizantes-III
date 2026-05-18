/**
 * Controller para la tabla Instituciones (CRUD Completo)
 * Permite crear, leer, actualizar y eliminar instituciones
 */
import supabase from '../config/supabase.js';

/**
 * GET /api/instituciones
 * Obtiene todas las instituciones activas
 */
export const getAll = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('instituciones')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/instituciones/:id
 * Obtiene una institución específica por ID
 */
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('instituciones')
      .select('*')
      .eq('institutionId', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Institución no encontrada'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/instituciones
 * Crea una nueva institución
 */
export const create = async (req, res, next) => {
  try {
    const { name, address } = req.body;

    // Validaciones
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El nombre es obligatorio'
      });
    }

    // Generar UUID y timestamps
    const newInstitution = {
      institutionId: crypto.randomUUID(),
      name: name.trim(),
      address: address?.trim() || null,
      active: true,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('instituciones')
      .insert([newInstitution])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'Institución creada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/instituciones/:id
 * Actualiza una institución existente
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address, active } = req.body;

    // Validaciones
    if (name !== undefined && (!name || name.trim() === '')) {
      return res.status(400).json({
        success: false,
        error: 'El nombre no puede estar vacío'
      });
    }

    // Construir objeto de actualización
    const updateData = {
      modifiedAt: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (active !== undefined) updateData.active = active;

    const { data, error } = await supabase
      .from('instituciones')
      .update(updateData)
      .eq('institutionId', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Institución no encontrada'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data,
      message: 'Institución actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/instituciones/:id
 * Eliminación lógica (marca como inactiva)
 */
export const softDelete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('instituciones')
      .update({ 
        active: false,
        modifiedAt: new Date().toISOString()
      })
      .eq('institutionId', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Institución no encontrada'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data,
      message: 'Institución eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/instituciones/:id/hard
 * Eliminación física permanente (usar con precaución)
 */
export const hardDelete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('instituciones')
      .delete()
      .eq('institutionId', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Institución no encontrada'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      message: 'Institución eliminada permanentemente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/instituciones/search?q=texto
 * Busca instituciones por nombre o dirección
 */
export const search = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El parámetro de búsqueda es obligatorio'
      });
    }

    const searchTerm = `%${q.trim()}%`;

    const { data, error } = await supabase
      .from('instituciones')
      .select('*')
      .eq('active', true)
      .or(`name.ilike.${searchTerm},address.ilike.${searchTerm}`)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (error) {
    next(error);
  }
};
