/**
 * Controller para la tabla Roles (Solo Lectura)
 * Los roles se gestionan directamente desde la base de datos
 */
import supabase from '../config/supabase.js';

/**
 * GET /api/roles
 * Obtiene todos los roles activos
 */
export const getAll = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/roles/:id
 * Obtiene un rol específico por ID
 */
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('roleId', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Rol no encontrado'
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
 * GET /api/roles/active
 * Obtiene solo los roles activos (para usar en selects/dropdowns)
 */
export const getActive = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('roleId, name')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
