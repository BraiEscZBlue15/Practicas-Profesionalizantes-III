import { supabase } from './supabaseAuth'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/**
 * Servicio para gestión de archivos en Supabase Storage
 */

const BUCKET_NAME = 'documentos' // Cambia esto al nombre de tu bucket

/**
 * Mapeo de roles a tiers
 */
const ROLE_TIER_MAP = {
  'administrador': 'tier1',
  'directivo': 'tier2',
  'estudiante': 'tier3',
  'publico': 'tier4'
}

/**
 * Obtener el tier basado en el rol del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} - tier (tier1-tier4)
 */
const getUserTier = async (userId) => {
  try {
    if (!userId) return 'tier4' // Por defecto: público
    
    // Obtener usuario con su rol
    const response = await axios.get(`${API_URL}/usuarios/${userId}`)
    const user = response.data.data
    
    if (!user || !user.role) return 'tier4'
    
    // Obtener nombre del rol (normalizar a minúsculas)
    const roleName = user.role.name?.toLowerCase() || 'publico'
    
    // Retornar tier correspondiente
    return ROLE_TIER_MAP[roleName] || 'tier4'
  } catch (error) {
    console.error('Error obteniendo tier del usuario:', error)
    return 'tier4' // Por defecto si hay error
  }
}

export const storageService = {
  /**
   * Subir un archivo al storage
   * @param {File} file - Archivo a subir
   * @param {string} folder - Carpeta opcional dentro del bucket
   * @param {string} userId - ID del usuario que sube el archivo (opcional)
   * @param {string} manualTier - Tier manual especificado por administrador (opcional)
   * @returns {Promise<{url: string, path: string}>}
   */
  uploadFile: async (file, folder = 'archivos', userId = null, manualTier = null) => {
    try {
      console.log('📤 Iniciando subida de archivo...')
      console.log('  - Archivo:', file.name)
      console.log('  - UserId:', userId)
      console.log('  - Manual Tier:', manualTier)
      
      // Verificar que haya sesión activa (usuario debe estar logueado)
      const { data: { session } } = await supabase.auth.getSession()
      
      console.log('🔐 Sesión de Supabase:', session ? '✅ Activa' : '❌ No existe')
      console.log('session exists?', !!session)
      
      if (!session) {
        console.error('❌ No hay sesión activa. El usuario debe hacer login.')
        throw new Error('Debes iniciar sesión para subir archivos')
      }
      
      // Si hay tier manual (administrador seleccionó), usarlo. Sino, obtener del rol del usuario
      const tier = manualTier || await getUserTier(userId)
      console.log('🎯 Tier asignado:', tier)
      
      // Generar nombre único para el archivo
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(7)
      const fileExt = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomString}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      console.log('📂 Ruta del archivo:', filePath)
      console.log('🔍 Debug - tier:', tier, 'bucket:', BUCKET_NAME, 'filePath:', filePath)

      console.log('📂 Ruta del archivo:', filePath)
      console.log('tier typeof:',typeof tier,'tier value:', tier)
      // Subir archivo con metadata incluyendo tier
      console.log('BUCKET_NAME literal:', JSON.stringify(BUCKET_NAME))

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type,
          metadata: { 
            tier: tier,
            userId: userId || 'anonymous',
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          },
          upsert: false
        })

      if (error) {
        console.error('❌ Error de Supabase Storage:', error)
        console.error('   - Mensaje:', error.message)
        console.error('   - Código:', error.statusCode)
        throw error
      }

      console.log('✅ Archivo subido exitosamente')

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

      console.log('🔗 URL pública:', urlData.publicUrl)

      return {
        url: urlData.publicUrl,
        path: filePath,
        originalName: file.name,
        tier: tier
      }
    } catch (error) {
      console.error('💥 Error subiendo archivo:', error)
      throw error
    }
  },

  /**
   * Eliminar un archivo del storage
   * @param {string} filePath - Ruta del archivo en el bucket
   */
  deleteFile: async (filePath) => {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath])

      if (error) throw error
    } catch (error) {
      console.error('Error eliminando archivo:', error)
      throw error
    }
  },

  /**
   * Obtener URL pública de un archivo
   * @param {string} filePath - Ruta del archivo en el bucket
   */
  getPublicUrl: (filePath) => {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)
    
    return data.publicUrl
  },

  /**
   * Listar archivos en una carpeta
   * @param {string} folder - Carpeta a listar
   */
  listFiles: async (folder = '') => {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(folder)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error listando archivos:', error)
      throw error
    }
  }
}
