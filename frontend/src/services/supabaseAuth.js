import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las credenciales de Supabase en las variables de entorno')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }
}
