import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

console.log('🔧 Configuración Supabase:')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NO DEFINIDA')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan credenciales de Supabase')
  throw new Error('Faltan las credenciales de Supabase en las variables de entorno')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

console.log('✅ Cliente de Supabase creado exitosamente')

// Manejar cambios en el estado de autenticación
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth event:', event)
  
  if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    console.log('📝 Sesión actualizada:', event)
  }
  
  if (event === 'SIGNED_OUT') {
    // Limpiar localStorage cuando se cierra sesión
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }
  
  if (!session && event !== 'INITIAL_SESSION') {
    console.warn('⚠️ Sesión perdida, redirigiendo al login...')
    // Redirigir al login si la sesión se pierde
    window.location.href = '/login'
  }
})

/**
 * Asegurar que tenemos una sesión válida antes de realizar operaciones
 * Refresca el token si está vencido
 */
export const ensureValidSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Error obteniendo sesión:', error)
      throw error
    }
    
    if (!session) {
      console.warn('⚠️ No hay sesión activa')
      window.location.href = '/login'
      return null
    }
    
    // Verificar si el token está vencido o por vencer
    const expiresAt = session.expires_at
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = expiresAt - now
    
    // Si ya expiró o está por vencer (menos de 5 minutos), refrescar
    if (timeUntilExpiry < 300) {
      console.log('🔄 Token expirado o por vencer, refrescando...')
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.error('❌ Error refrescando sesión:', refreshError)
        // Si falla el refresco, redirigir al login
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        window.location.href = '/login'
        return null
      }
      
      console.log('✅ Sesión refrescada exitosamente')
      return refreshData.session
    }
    
    return session
  } catch (error) {
    console.error('❌ Error en ensureValidSession:', error)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.location.href = '/login'
    return null
  }
}

// ============================================================
// SERVICIOS DE AUTENTICACIÓN
// ============================================================

export const authService = {
  /**
   * Registrar nuevo usuario con email y contraseña
   */
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          surname: userData.surname,
          role: userData.role,
          institution: userData.institution
        }
      }
    })

    if (error) throw error
    return data
  },

  /**
   * Iniciar sesión con email y contraseña
   */
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  /**
   * Cerrar sesión
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  /**
   * Obtener sesión actual
   */
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  /**
   * Escuchar cambios en la autenticación
   */
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  /**
   * Resetear contraseña
   */
  resetPassword: async (email, redirectTo) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    })
    if (error) throw error
  },

  /**
   * Actualizar contraseña del usuario autenticado por recovery link
   */
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  }
}
