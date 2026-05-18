import crypto from 'crypto'
import { supabase } from '../config/supabase.js'

/**
 * Obtener todos los usuarios activos con información de rol e institución
 */
export const getAll = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        userId,
        name,
        surname,
        email,
        active,
        createdAt,
        modifiedAt,
        role,
        institution
      `)
      .eq('active', true)
      .order('surname', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error en getAll usuarios:', error)
      throw error
    }

    // Enriquecer con datos de roles e instituciones
    const enrichedData = await Promise.all(data.map(async (user) => {
      const enriched = { ...user }
      
      // Obtener rol
      if (user.role) {
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('*')
          .eq('roleId', user.role)
          .single()
        
        if (roleError) {
          console.error(`❌ Error obteniendo rol para ${user.email}:`, roleError)
          console.error(`   roleId buscado: ${user.role}`)
        } else {
          console.log(`✅ Rol obtenido para ${user.email}:`, roleData)
          enriched.role = roleData
        }
      }
      
      // Obtener institución
      if (user.institution) {
        const { data: instData, error: instError } = await supabase
          .from('instituciones')
          .select('institutionId, name')
          .eq('institutionId', user.institution)
          .single()
        
        if (instError) {
          console.error(`❌ Error obteniendo institución para ${user.email}:`, instError)
        } else {
          enriched.institution = instData
        }
      }
      
      return enriched
    }))

    console.log('📦 Enviando respuesta con usuarios enriquecidos:')
    console.log('   - Total usuarios:', enrichedData.length)
    if (enrichedData.length > 0) {
      console.log('   - Primer usuario completo:', JSON.stringify(enrichedData[0], null, 2))
    }

    res.json({
      success: true,
      data: enrichedData || []
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Obtener un usuario por ID con información de rol e institución
 */
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        userId,
        name,
        surname,
        email,
        active,
        createdAt,
        modifiedAt,
        role,
        institution
      `)
      .eq('userId', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        })
      }
      throw error
    }

    // Enriquecer con datos de rol e institución
    const enriched = { ...data }
    
    if (data.role) {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('*')
        .eq('roleId', data.role)
        .single()
      
      if (roleError) {
        console.error('Error obteniendo rol:', roleError)
      } else {
        enriched.role = roleData
      }
    }
    
    if (data.institution) {
      const { data: instData, error: instError } = await supabase
        .from('instituciones')
        .select('institutionId, name')
        .eq('institutionId', data.institution)
        .single()
      
      if (instError) {
        console.error('Error obteniendo institución:', instError)
      } else {
        enriched.institution = instData
      }
    }

    console.log('✅ Usuario enriquecido:', enriched)

    res.json({
      success: true,
      data: enriched
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Crear un nuevo usuario
 */
export const create = async (req, res, next) => {
  try {
    const { name, surname, email, role, institution } = req.body

    // Validaciones
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      })
    }

    if (!surname || !surname.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El apellido es requerido'
      })
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El email es requerido'
      })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'El formato del email no es válido'
      })
    }

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('userId')
      .eq('email', email.trim())
      .eq('active', true)
      .single()

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con este email'
      })
    }

    // Crear el nuevo usuario
    const newUser = {
      userId: userId || crypto.randomUUID(), // Permitir userId personalizado desde Supabase Auth
      name: name.trim(),
      surname: surname.trim(),
      email: email.trim().toLowerCase(),
      role: role || null,
      institution: institution || null,
      active: true,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert([newUser])
      .select(`
        userId,
        name,
        surname,
        email,
        active,
        createdAt,
        modifiedAt,
        role,
        institution
      `)
      .single()

    if (error) {
      console.error('Error creando usuario:', error)
      throw error
    }

    // Enriquecer respuesta
    const enriched = { ...data }
    
    if (data.role) {
      const { data: roleData } = await supabase
        .from('roles')
        .select('*')
        .eq('roleId', data.role)
        .single()
      enriched.role = roleData
    }
    
    if (data.institution) {
      const { data: instData } = await supabase
        .from('instituciones')
        .select('institutionId, name')
        .eq('institutionId', data.institution)
        .single()
      enriched.institution = instData
    }

    res.status(201).json({
      success: true,
      data: enriched,
      message: 'Usuario creado exitosamente'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Actualizar un usuario existente
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, surname, email, role, institution } = req.body

    // Validaciones
    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({
        success: false,
        error: 'El nombre no puede estar vacío'
      })
    }

    if (surname !== undefined && (!surname || !surname.trim())) {
      return res.status(400).json({
        success: false,
        error: 'El apellido no puede estar vacío'
      })
    }

    if (email !== undefined) {
      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          error: 'El email no puede estar vacío'
        })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          error: 'El formato del email no es válido'
        })
      }

      // Verificar si el email ya existe en otro usuario
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('userId')
        .eq('email', email.trim())
        .eq('active', true)
        .neq('userId', id)
        .single()

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe otro usuario con este email'
        })
      }
    }

    // Construir objeto de actualización
    const updates = {
      modifiedAt: new Date().toISOString()
    }

    if (name !== undefined) updates.name = name.trim()
    if (surname !== undefined) updates.surname = surname.trim()
    if (email !== undefined) updates.email = email.trim().toLowerCase()
    if (role !== undefined) updates.role = role || null
    if (institution !== undefined) updates.institution = institution || null

    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('userId', id)
      .select(`
        userId,
        name,
        surname,
        email,
        active,
        createdAt,
        modifiedAt,
        role,
        institution
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        })
      }
      throw error
    }

    // Enriquecer respuesta
    const enriched = { ...data }
    
    if (data.role) {
      const { data: roleData } = await supabase
        .from('roles')
        .select('*')
        .eq('roleId', data.role)
        .single()
      enriched.role = roleData
    }
    
    if (data.institution) {
      const { data: instData } = await supabase
        .from('instituciones')
        .select('institutionId, name')
        .eq('institutionId', data.institution)
        .single()
      enriched.institution = instData
    }

    res.json({
      success: true,
      data: enriched,
      message: 'Usuario actualizado exitosamente'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Eliminación lógica (soft delete) de un usuario
 */
export const softDelete = async (req, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('usuarios')
      .update({
        active: false,
        modifiedAt: new Date().toISOString()
      })
      .eq('userId', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        })
      }
      throw error
    }

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Eliminación física (hard delete) de un usuario
 */
export const hardDelete = async (req, res, next) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('userId', id)

    if (error) throw error

    res.json({
      success: true,
      message: 'Usuario eliminado permanentemente'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Buscar usuarios por nombre, apellido o email
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
      .from('usuarios')
      .select(`
        userId,
        name,
        surname,
        email,
        active,
        createdAt,
        modifiedAt,
        role,
        institution
      `)
      .eq('active', true)
      .or(`name.ilike.${searchTerm},surname.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .order('surname', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error

    // Enriquecer resultados
    const enrichedData = await Promise.all(data.map(async (user) => {
      const enriched = { ...user }
      
      if (user.role) {
        const { data: roleData } = await supabase
          .from('roles')
          .select('*')
          .eq('roleId', user.role)
          .single()
        enriched.role = roleData
      }
      
      if (user.institution) {
        const { data: instData } = await supabase
          .from('instituciones')
          .select('institutionId, name')
          .eq('institutionId', user.institution)
          .single()
        enriched.institution = instData
      }
      
      return enriched
    }))

    res.json({
      success: true,
      data: enrichedData || [],
      count: enrichedData?.length || 0
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Obtener usuarios por rol
 */
export const getByRole = async (req, res, next) => {
  try {
    const { roleId } = req.params

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        userId,
        name,
        surname,
        email,
        active,
        createdAt,
        modifiedAt,
        role,
        institution
      `)
      .eq('active', true)
      .eq('role', roleId)
      .order('surname', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error

    // Enriquecer resultados
    const enrichedData = await Promise.all(data.map(async (user) => {
      const enriched = { ...user }
      
      if (user.role) {
        const { data: roleData } = await supabase
          .from('roles')
          .select('*')
          .eq('roleId', user.role)
          .single()
        enriched.role = roleData
      }
      
      if (user.institution) {
        const { data: instData } = await supabase
          .from('instituciones')
          .select('institutionId, name')
          .eq('institutionId', user.institution)
          .single()
        enriched.institution = instData
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
 * Obtener usuarios por institución
 */
export const getByInstitution = async (req, res, next) => {
  try {
    const { institutionId } = req.params

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        userId,
        name,
        surname,
        email,
        active,
        createdAt,
        modifiedAt,
        role,
        institution
      `)
      .eq('active', true)
      .eq('institution', institutionId)
      .order('surname', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error

    // Enriquecer resultados
    const enrichedData = await Promise.all(data.map(async (user) => {
      const enriched = { ...user }
      
      if (user.role) {
        const { data: roleData } = await supabase
          .from('roles')
          .select('*')
          .eq('roleId', user.role)
          .single()
        enriched.role = roleData
      }
      
      if (user.institution) {
        const { data: instData } = await supabase
          .from('instituciones')
          .select('institutionId, name')
          .eq('institutionId', user.institution)
          .single()
        enriched.institution = instData
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
