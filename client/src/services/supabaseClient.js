import { supabase } from './supabaseAuth'
import { ensureValidSession } from './supabaseAuth'

/**
 * Servicio unificado para interactuar directamente con Supabase
 * Reemplaza todas las llamadas al backend Express
 */

// ==================== USUARIOS ====================

export const usuariosService = {
  /**
   * Obtener todos los usuarios activos con roles e instituciones
   */
  getAll: async () => {
    console.log('🔍 usuariosService.getAll() - Iniciando query...')

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        userId,
        name,
        surname,
        email,
        active,
        pending,
        message,
        createdAt,
        modifiedAt,
        role,
        institution
      `)
      .eq('active', true)
      .order('surname', { ascending: true })
      .order('name', { ascending: true })

    console.log('📊 Query inicial completado')
    console.log('   - Error:', error)
    console.log('   - Data recibida:', data?.length, 'usuarios')
    console.log('   - Primer usuario raw:', data?.[0])

    if (error) {
      console.error('❌ Error en query inicial:', error)
      throw error
    }

    // Enriquecer manualmente con datos de roles e instituciones
    if (data && data.length > 0) {
      console.log('🔄 Iniciando enriquecimiento de', data.length, 'usuarios...')

      const enrichedData = await Promise.all(data.map(async (user, index) => {
        console.log(`   Enriqueciendo usuario ${index + 1}/${data.length}:`, user.email)
        const enriched = { ...user }

        // Obtener rol
        if (user.role) {
          console.log(`     - Buscando rol con ID:`, user.role)
          const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('roleId, name, active, createdAt, modifiedAt')
            .eq('roleId', user.role)
            .single()

          if (roleError) {
            console.error(`     ❌ Error obteniendo rol:`, roleError)
          } else {
            console.log(`     ✅ Rol encontrado:`, roleData)
            enriched.role = roleData
          }
        } else {
          console.log(`     ⚠️ Usuario sin rol asignado`)
        }

        // Obtener institución
        if (user.institution) {
          const { data: instData, error: instError } = await supabase
            .from('instituciones')
            .select('institutionId, name')
            .eq('institutionId', user.institution)
            .single()

          if (instError) {
            console.error(`     ❌ Error obteniendo institución:`, instError)
          } else {
            enriched.institution = instData
          }
        }

        console.log(`     ✅ Usuario enriquecido:`, enriched)
        return enriched
      }))

      console.log('✅ Enriquecimiento completado')
      console.log('📦 Datos finales:', enrichedData)
      return enrichedData
    }

    return data || []
  },

  /**
   * Obtener usuario por ID con rol e institución
   */
  getById: async (id) => {
    console.log('🔍 usuariosService.getById() - Buscando usuario:', id)

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('userId', id)
      .single()

    console.log('📊 Query getById completado')
    console.log('   - Error:', error)
    console.log('   - Data:', data)

    if (error) {
      console.error('❌ Error en getById:', error)
      throw error
    }

    // Enriquecer con rol
    if (data && data.role) {
      console.log('🔄 Enriqueciendo rol:', data.role)
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('*')
        .eq('roleId', data.role)
        .single()

      if (roleError) {
        console.error('❌ Error obteniendo rol:', roleError)
      } else {
        console.log('✅ Rol enriquecido:', roleData)
        data.role = roleData
      }
    }

    // Enriquecer con institución
    if (data && data.institution) {
      console.log('🔄 Enriqueciendo institución:', data.institution)
      const { data: instData, error: instError } = await supabase
        .from('instituciones')
        .select('institutionId, name')
        .eq('institutionId', data.institution)
        .single()

      if (instError) {
        console.error('❌ Error obteniendo institución:', instError)
      } else {
        data.institution = instData
      }
    }

    console.log('✅ Usuario final enriquecido:', data)
    return data
  },

  /**
   * Crear nuevo usuario
   */
  create: async (userData) => {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([userData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualizar usuario
   */
  update: async (id, userData) => {
    const { data, error } = await supabase
      .from('usuarios')
      .update(userData)
      .eq('userId', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Eliminar usuario (soft delete)
   */
  delete: async (id) => {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ active: false })
      .eq('userId', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// ==================== ROLES ====================

export const rolesService = {
  /**
   * Obtener todos los roles activos
   */
  getAll: async () => {
    console.log('🔍 rolesService.getAll() - Iniciando query...')

    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })

    console.log('📋 rolesService.getAll() - Resultado:', { data, error })

    if (error) {
      console.error('❌ Error en rolesService.getAll():', error)
      throw error
    }

    console.log('✅ rolesService.getAll() - Roles obtenidos:', data?.length || 0)
    return data || []
  },

  /**
   * Obtener rol por ID
   */
  getById: async (id) => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('roleId', id)
      .single()

    if (error) throw error
    return data
  }
}

// ==================== INSTITUCIONES ====================

const mapInstitucionRow = (row) => {
  if (!row) return row

  return {
    institutionId: row.institutionId ?? row.institutionid ?? row.id ?? null,
    name: row.name ?? row.institutionname ?? '',
    address: row.address ?? row.direccion ?? '',
    active: row.active ?? true,
    createdAt: row.createdAt ?? row.createdat ?? null,
    modifiedAt: row.modifiedAt ?? row.modifiedat ?? null
  }
}

const buildInstitucionWritePayload = (institucionData, includeCreatedAt = false) => {
  const payload = {
    institutionid: institucionData.institutionId || institucionData.institutionid || crypto.randomUUID(),
    name: institucionData.name,
    address: institucionData.address || null,
    active: institucionData.active !== undefined ? institucionData.active : true,
    modifiedat: new Date().toISOString()
  }

  if (includeCreatedAt) {
    payload.createdat = new Date().toISOString()
  }

  return payload
}

export const institucionesService = {
  /**
   * Obtener todas las instituciones activas
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from('instituciones')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []).map(mapInstitucionRow)
  },

  /**
   * Obtener institución por ID
   */
  getById: async (id) => {
    const { data, error } = await supabase
      .from('instituciones')
      .select('*')
      .or(`institutionId.eq.${id},institutionid.eq.${id}`)
      .single()

    if (error) throw error
    return mapInstitucionRow(data)
  },

  /**
   * Buscar instituciones por nombre o dirección
   */
  search: async (query) => {
    const searchTerm = query.trim()

    if (!searchTerm) {
      return institucionesService.getAll()
    }

    try {
      const { data, error } = await supabase
        .from('instituciones')
        .select('*')
        .eq('active', true)
        .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
        .order('name', { ascending: true })

      if (error) throw error
      return (data || []).map(mapInstitucionRow)
    } catch (error) {
      console.warn('⚠️ Búsqueda con address falló, reintentando solo por name:', error)

      const { data, error: fallbackError } = await supabase
        .from('instituciones')
        .select('*')
        .eq('active', true)
        .ilike('name', `%${searchTerm}%`)
        .order('name', { ascending: true })

      if (fallbackError) throw fallbackError
      return (data || []).map(mapInstitucionRow)
    }
  },

  /**
   * Crear nueva institución
   */
  create: async (institucionData) => {
    const dataToInsert = buildInstitucionWritePayload(institucionData, true)

    const { data, error } = await supabase
      .from('instituciones')
      .insert([dataToInsert])
      .select()
      .single()

    if (error) throw error
    return mapInstitucionRow(data)
  },

  /**
   * Actualizar institución
   */
  update: async (id, institucionData) => {
    const dataToUpdate = buildInstitucionWritePayload({
      ...institucionData,
      institutionId: id
    })
    delete dataToUpdate.institutionid

    const { data, error } = await supabase
      .from('instituciones')
      .update(dataToUpdate)
      .or(`institutionId.eq.${id},institutionid.eq.${id}`)
      .select()
      .single()

    if (error) throw error
    return mapInstitucionRow(data)
  },

  /**
   * Eliminar institución (soft delete)
   */
  delete: async (id) => {
    const { data, error } = await supabase
      .from('instituciones')
      .update({ active: false, modifiedat: new Date().toISOString() })
      .or(`institutionId.eq.${id},institutionid.eq.${id}`)
      .select()
      .single()

    if (error) throw error
    return mapInstitucionRow(data)
  }
}

// ==================== DOCUMENTOS ====================

export const documentosService = {
  /**
   * Obtener todos los documentos activos con relaciones
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('active', true)
      .order('createdAt', { ascending: false })

    if (error) throw error

    // Enriquecer manualmente con datos de instituciones y usuarios
    if (data && data.length > 0) {
      const enrichedData = await Promise.all(data.map(async (doc) => {
        const enriched = { ...doc }

        // Obtener institución
        if (doc.institution) {
          const { data: instData } = await supabase
            .from('instituciones')
            .select('institutionId, name')
            .eq('institutionId', doc.institution)
            .single()
          enriched.institution = instData
        }

        // Obtener owner
        if (doc.owner) {
          const { data: ownerData } = await supabase
            .from('usuarios')
            .select('userId, name, surname, email')
            .eq('userId', doc.owner)
            .single()
          enriched.owner = ownerData
        }

        // Obtener createdBy
        if (doc.createdBy) {
          const { data: creatorData } = await supabase
            .from('usuarios')
            .select('userId, name, surname, email')
            .eq('userId', doc.createdBy)
            .single()
          enriched.createdBy = creatorData
        }

        return enriched
      }))

      return enrichedData
    }

    return data || []
  },

  /**
   * Obtener documento por ID
   */
  getById: async (id) => {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('documentId', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Crear nuevo documento
   */
  create: async (documentoData) => {
    const dataToInsert = {
      ...documentoData,
      documentId: documentoData.documentId || crypto.randomUUID(),
      active: documentoData.active !== undefined ? documentoData.active : true,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('documentos')
      .insert([dataToInsert])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualizar documento
   */
  update: async (id, documentoData) => {
    const dataToUpdate = {
      ...documentoData,
      modifiedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('documentos')
      .update(dataToUpdate)
      .eq('documentId', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Eliminar documento (soft delete)
   */
  delete: async (id) => {
    const { data, error } = await supabase
      .from('documentos')
      .update({ active: false })
      .eq('documentId', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Buscar documentos por nombre o descripción
   */
  search: async (searchTerm) => {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('active', true)
      .ilike('name', `%${searchTerm}%`)
      .order('createdAt', { ascending: false })

    if (error) throw error

    // Enriquecer con instituciones y usuarios
    if (data && data.length > 0) {
      const enrichedData = await Promise.all(data.map(async (doc) => {
        const enriched = { ...doc }

        // Obtener institución
        if (doc.institution) {
          const { data: instData } = await supabase
            .from('instituciones')
            .select('institutionId, name')
            .eq('institutionId', doc.institution)
            .single()
          enriched.institution = instData
        }

        // Obtener owner
        if (doc.owner) {
          const { data: ownerData } = await supabase
            .from('usuarios')
            .select('userId, name, surname, email')
            .eq('userId', doc.owner)
            .single()
          enriched.owner = ownerData
        }

        // Obtener createdBy
        if (doc.createdBy) {
          const { data: creatorData } = await supabase
            .from('usuarios')
            .select('userId, name, surname, email')
            .eq('userId', doc.createdBy)
            .single()
          enriched.createdBy = creatorData
        }

        return enriched
      }))

      return enrichedData
    }


    return data || []
  }
}

// ==================== PLANOS ====================

export const planosService = {
  /**
   * Obtener todos los planos activos con datos enriquecidos
   */
  getAll: async () => {
    // No validar sesión en lectura - dejamos que Supabase maneje el refresh automático
    const { data, error } = await supabase
      .from('planos')
      .select('*')
      .eq('active', true)
      .order('createdat', { ascending: false })

    if (error) throw error

    // Enriquecer con instituciones y usuarios
    if (data && data.length > 0) {
      const enrichedData = await Promise.all(data.map(async (plano) => {
        const enriched = { ...plano }

        // Obtener institución
        if (plano.institution) {
          const { data: instData } = await supabase
            .from('instituciones')
            .select('institutionId, name')
            .eq('institutionId', plano.institution)
            .single()
          enriched.institution = instData
        }

        // Obtener createdBy
        if (plano.createdby) {
          const { data: creatorData } = await supabase
            .from('usuarios')
            .select('userid, name, surname, email')
            .eq('userid', plano.createdby)
            .single()
          enriched.createdby = creatorData
        }

        // Obtener modifiedBy
        if (plano.modifiedby) {
          const { data: modifierData } = await supabase
            .from('usuarios')
            .select('userid, name, surname, email')
            .eq('userid', plano.modifiedby)
            .single()
          enriched.modifiedby = modifierData
        }

        return enriched
      }))

      return enrichedData
    }

    return data || []
  },

  /**
   * Obtener plano por ID
   */
  getById: async (id) => {
    const { data, error } = await supabase
      .from('planos')
      .select('*')
      .eq('planoid', id)
      .eq('active', true)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtener planos por institución
   */
  getByInstitution: async (institutionId) => {
    const { data, error } = await supabase
      .from('planos')
      .select('*')
      .eq('institution', institutionId)
      .eq('active', true)
      .order('createdat', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Crear nuevo plano
   */
  create: async (planoData) => {
    await ensureValidSession() // Asegurar sesión válida

    const { data, error } = await supabase
      .from('planos')
      .insert([{
        ...planoData,
        active: true,
        createdat: new Date().toISOString(),
        modifiedat: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualizar plano existente
   */
  update: async (id, planoData) => {
    await ensureValidSession() // Asegurar sesión válida

    const { data, error } = await supabase
      .from('planos')
      .update({
        ...planoData,
        modifiedat: new Date().toISOString()
      })
      .eq('planoid', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Eliminar plano (soft delete)
   */
  delete: async (id) => {
    await ensureValidSession() // Asegurar sesión válida

    const { data, error } = await supabase
      .from('planos')
      .update({
        active: false,
        modifiedat: new Date().toISOString()
      })
      .eq('planoid', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// ==================== MODO GESTIÓN ====================

const MODO_GESTION_TABLE = 'modogestion'

const mapModoGestionRow = (row) => {
  if (!row) return row

  return {
    gestionId: row.gestionid,
    gestionName: row.gestionname,
    createdAt: row.createdat
  }
}

export const modoGestionService = {
  /**
   * Obtener todos los modos de gestión
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from(MODO_GESTION_TABLE)
      .select('gestionid, gestionname, createdat')
      .order('createdat', { ascending: false })

    if (error) throw error
    return (data || []).map(mapModoGestionRow)
  },

  /**
   * Obtener modo de gestión por ID
   */
  getById: async (id) => {
    const { data, error } = await supabase
      .from(MODO_GESTION_TABLE)
      .select('gestionid, gestionname, createdat')
      .eq('gestionid', id)
      .single()

    if (error) throw error
    return mapModoGestionRow(data)
  },

  /**
   * Crear nuevo modo de gestión
   */
  create: async ({ gestionName }) => {
    await ensureValidSession()

    const { data, error } = await supabase
      .from(MODO_GESTION_TABLE)
      .insert([{ gestionname: gestionName }])
      .select('gestionid, gestionname, createdat')
      .single()

    if (error) throw error
    return mapModoGestionRow(data)
  },

  /**
   * Actualizar nombre del modo de gestión
   */
  update: async (id, { gestionName }) => {
    await ensureValidSession()

    const { data, error } = await supabase
      .from(MODO_GESTION_TABLE)
      .update({ gestionname: gestionName })
      .eq('gestionid', id)
      .select('gestionid, gestionname, createdat')
      .single()

    if (error) throw error
    return mapModoGestionRow(data)
  },

  /**
   * Eliminar modo de gestión
   */
  delete: async (id) => {
    await ensureValidSession()

    const { error } = await supabase
      .from(MODO_GESTION_TABLE)
      .delete()
      .eq('gestionid', id)

    if (error) throw error
    return true
  }
}
