import crypto from 'crypto'
import { supabase } from '../config/supabase.js'

/**
 * Obtener todos los documentos activos con información relacionada
 */
export const getAll = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .select(`
        documentId,
        name,
        type,
        url,
        active,
        createdAt,
        modifiedAt,
        createdBy,
        modifiedBy,
        institution,
        owner
      `)
      .eq('active', true)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error en getAll documentos:', error)
      throw error
    }

    // Obtener información adicional de usuarios e instituciones
    const enrichedData = await Promise.all(data.map(async (doc) => {
      const enriched = { ...doc }
      
      // Obtener createdBy
      if (doc.createdBy) {
        const { data: user } = await supabase
          .from('usuarios')
          .select('userId, name, surname, email')
          .eq('userId', doc.createdBy)
          .single()
        enriched.createdBy = user
      }
      
      // Obtener modifiedBy
      if (doc.modifiedBy) {
        const { data: user } = await supabase
          .from('usuarios')
          .select('userId, name, surname, email')
          .eq('userId', doc.modifiedBy)
          .single()
        enriched.modifiedBy = user
      }
      
      // Obtener owner
      if (doc.owner) {
        const { data: user } = await supabase
          .from('usuarios')
          .select('userId, name, surname, email')
          .eq('userId', doc.owner)
          .single()
        enriched.owner = user
      }
      
      // Obtener institution
      if (doc.institution) {
        const { data: inst } = await supabase
          .from('instituciones')
          .select('institutionId, name')
          .eq('institutionId', doc.institution)
          .single()
        enriched.institution = inst
      }
      
      return enriched
    }))

    res.json({
      success: true,
      data: enrichedData || []
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Obtener un documento por ID con información relacionada
 */
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('documentos')
      .select(`
        documentId,
        name,
        type,
        url,
        active,
        createdAt,
        modifiedAt,
        createdBy,
        modifiedBy,
        institution,
        owner
      `)
      .eq('documentId', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Documento no encontrado'
        })
      }
      throw error
    }

    // Enriquecer con datos relacionados
    const enriched = { ...data }
    
    if (data.createdBy) {
      const { data: user } = await supabase
        .from('usuarios')
        .select('userId, name, surname, email')
        .eq('userId', data.createdBy)
        .single()
      enriched.createdBy = user
    }
    
    if (data.modifiedBy) {
      const { data: user } = await supabase
        .from('usuarios')
        .select('userId, name, surname, email')
        .eq('userId', data.modifiedBy)
        .single()
      enriched.modifiedBy = user
    }
    
    if (data.owner) {
      const { data: user } = await supabase
        .from('usuarios')
        .select('userId, name, surname, email')
        .eq('userId', data.owner)
        .single()
      enriched.owner = user
    }
    
    if (data.institution) {
      const { data: inst } = await supabase
        .from('instituciones')
        .select('institutionId, name')
        .eq('institutionId', data.institution)
        .single()
      enriched.institution = inst
    }

    res.json({
      success: true,
      data: enriched
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Crear un nuevo documento
 */
export const create = async (req, res, next) => {
  try {
    const { name, type, url, institution, owner, createdBy } = req.body

    // Validaciones
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El nombre del documento es requerido'
      })
    }

    if (!url || !url.trim()) {
      return res.status(400).json({
        success: false,
        error: 'La URL del documento es requerida'
      })
    }

    // Crear el nuevo documento
    const newDocument = {
      documentId: crypto.randomUUID(),
      name: name.trim(),
      type: type?.trim() || null,
      url: url.trim(),
      institution: institution || null,
      owner: owner || null,
      createdBy: createdBy || null,
      modifiedBy: createdBy || null, // Al crear, modifiedBy es igual a createdBy
      active: true,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    }
      console.log('Nuevo documento a crear:', newDocument)
      
    const { data, error } = await supabase
      .from('documentos')
      .insert([newDocument])
      .select(`
        documentId,
        name,
        type,
        url,
        active,
        createdAt,
        modifiedAt,
        createdBy:usuarios!documentos_createdBy_fk(userId, name, surname, email),
        modifiedBy:usuarios!documentos_modifiedBy_fk(userId, name, surname, email),
        institution:instituciones(institutionId, name),
        owner:usuarios!documentos_owner_fk(userId, name, surname, email)
      `)
      .single()

    if (error) throw error

    res.status(201).json({
      success: true,
      data,
      message: 'Documento creado exitosamente'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Actualizar un documento existente
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, type, url, institution, owner, modifiedBy } = req.body

    // Validaciones
    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({
        success: false,
        error: 'El nombre del documento no puede estar vacío'
      })
    }

    if (url !== undefined && (!url || !url.trim())) {
      return res.status(400).json({
        success: false,
        error: 'La URL del documento no puede estar vacía'
      })
    }

    // Construir objeto de actualización
    const updates = {
      modifiedAt: new Date().toISOString()
    }

    if (name !== undefined) updates.name = name.trim()
    if (type !== undefined) updates.type = type?.trim() || null
    if (url !== undefined) updates.url = url.trim()
    if (institution !== undefined) updates.institution = institution || null
    if (owner !== undefined) updates.owner = owner || null
    if (modifiedBy !== undefined) updates.modifiedBy = modifiedBy || null

    const { data, error } = await supabase
      .from('documentos')
      .update(updates)
      .eq('documentId', id)
      .select(`
        documentId,
        name,
        type,
        url,
        active,
        createdAt,
        modifiedAt,
        createdBy:usuarios!documentos_createdBy_fk(userId, name, surname, email),
        modifiedBy:usuarios!documentos_modifiedBy_fk(userId, name, surname, email),
        institution:instituciones(institutionId, name),
        owner:usuarios!documentos_owner_fk(userId, name, surname, email)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Documento no encontrado'
        })
      }
      throw error
    }

    res.json({
      success: true,
      data,
      message: 'Documento actualizado exitosamente'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Eliminación lógica (soft delete) de un documento
 */
export const softDelete = async (req, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('documentos')
      .update({
        active: false,
        modifiedAt: new Date().toISOString()
      })
      .eq('documentId', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Documento no encontrado'
        })
      }
      throw error
    }

    res.json({
      success: true,
      message: 'Documento desactivado exitosamente'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Eliminación física (hard delete) de un documento
 */
export const hardDelete = async (req, res, next) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('documentos')
      .delete()
      .eq('documentId', id)

    if (error) throw error

    res.json({
      success: true,
      message: 'Documento eliminado permanentemente'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Buscar documentos por nombre o tipo
 */
export const search = async (req, res, next) => {
  try {
    const { q } = req.query

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro de búsqueda "q" es requerido'
      })
    }

    const searchTerm = `%${q.trim()}%`

    const { data, error } = await supabase
      .from('documentos')
      .select(`
        documentId,
        name,
        type,
        url,
        active,
        createdAt,
        modifiedAt,
        createdBy:usuarios!documentos_createdBy_fk(userId, name, surname, email),
        modifiedBy:usuarios!documentos_modifiedBy_fk(userId, name, surname, email),
        institution:instituciones(institutionId, name),
        owner:usuarios!documentos_owner_fk(userId, name, surname, email)
      `)
      .eq('active', true)
      .or(`name.ilike.${searchTerm},type.ilike.${searchTerm}`)
      .order('createdAt', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Obtener documentos por institución
 */
export const getByInstitution = async (req, res, next) => {
  try {
    const { institutionId } = req.params

    const { data, error } = await supabase
      .from('documentos')
      .select(`
        documentId,
        name,
        type,
        url,
        active,
        createdAt,
        modifiedAt,
        createdBy:usuarios!documentos_createdBy_fk(userId, name, surname, email),
        modifiedBy:usuarios!documentos_modifiedBy_fk(userId, name, surname, email),
        institution:instituciones(institutionId, name),
        owner:usuarios!documentos_owner_fk(userId, name, surname, email)
      `)
      .eq('active', true)
      .eq('institution', institutionId)
      .order('createdAt', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Obtener documentos por propietario (owner)
 */
export const getByOwner = async (req, res, next) => {
  try {
    const { userId } = req.params

    const { data, error } = await supabase
      .from('documentos')
      .select(`
        documentId,
        name,
        type,
        url,
        active,
        createdAt,
        modifiedAt,
        createdBy:usuarios!documentos_createdBy_fk(userId, name, surname, email),
        modifiedBy:usuarios!documentos_modifiedBy_fk(userId, name, surname, email),
        institution:instituciones(institutionId, name),
        owner:usuarios!documentos_owner_fk(userId, name, surname, email)
      `)
      .eq('active', true)
      .eq('owner', userId)
      .order('createdAt', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Obtener documentos por tipo
 */
export const getByType = async (req, res, next) => {
  try {
    const { type } = req.params

    const { data, error } = await supabase
      .from('documentos')
      .select(`
        documentId,
        name,
        type,
        url,
        active,
        createdAt,
        modifiedAt,
        createdBy:usuarios!documentos_createdBy_fk(userId, name, surname, email),
        modifiedBy:usuarios!documentos_modifiedBy_fk(userId, name, surname, email),
        institution:instituciones(institutionId, name),
        owner:usuarios!documentos_owner_fk(userId, name, surname, email)
      `)
      .eq('active', true)
      .eq('type', type)
      .order('createdAt', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    next(error)
  }
}
