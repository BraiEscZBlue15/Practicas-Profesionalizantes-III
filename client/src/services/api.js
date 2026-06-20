import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para manejo de errores global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Servicios CRUD para ejemplos
const exampleService = {
  // GET /api/examples - Obtener todos
  getAll: async () => {
    const response = await api.get('/examples')
    return response.data.data
  },

  // GET /api/examples/:id - Obtener uno por ID
  getById: async (id) => {
    const response = await api.get(`/examples/${id}`)
    return response.data.data
  },

  // POST /api/examples - Crear nuevo
  create: async (data) => {
    const response = await api.post('/examples', data)
    return response.data.data
  },

  // PUT /api/examples/:id - Actualizar
  update: async (id, data) => {
    const response = await api.put(`/examples/${id}`, data)
    return response.data.data
  },

  // DELETE /api/examples/:id - Eliminar
  delete: async (id) => {
    const response = await api.delete(`/examples/${id}`)
    return response.data
  }
}

// ============================================================
// SERVICIOS PARA ROLES (Solo Lectura)
// ============================================================
export const rolesService = {
  // GET /api/roles - Obtener todos los roles activos
  getAll: async () => {
    const response = await api.get('/roles')
    return response.data.data
  },

  // GET /api/roles/:id - Obtener un rol por ID
  getById: async (id) => {
    const response = await api.get(`/roles/${id}`)
    return response.data.data
  },

  // GET /api/roles/active - Obtener roles activos para dropdown/select
  getActive: async () => {
    const response = await api.get('/roles/active')
    return response.data.data
  }
}

// ============================================================
// SERVICIOS PARA INSTITUCIONES (CRUD Completo)
// ============================================================
export const institucionesService = {
  // GET /api/instituciones - Obtener todas las instituciones activas
  getAll: async () => {
    const response = await api.get('/instituciones')
    return response.data.data
  },

  // GET /api/instituciones/:id - Obtener una institución por ID
  getById: async (id) => {
    const response = await api.get(`/instituciones/${id}`)
    return response.data.data
  },

  // POST /api/instituciones - Crear nueva institución
  create: async (data) => {
    const response = await api.post('/instituciones', data)
    return response.data.data
  },

  // PUT /api/instituciones/:id - Actualizar institución
  update: async (id, data) => {
    const response = await api.put(`/instituciones/${id}`, data)
    return response.data.data
  },

  // DELETE /api/instituciones/:id - Eliminación lógica
  delete: async (id) => {
    const response = await api.delete(`/instituciones/${id}`)
    return response.data
  },

  // DELETE /api/instituciones/:id/hard - Eliminación física (usar con precaución)
  hardDelete: async (id) => {
    const response = await api.delete(`/instituciones/${id}/hard`)
    return response.data
  },

  // GET /api/instituciones/search?q=texto - Buscar instituciones
  search: async (query) => {
    const response = await api.get(`/instituciones/search?q=${encodeURIComponent(query)}`)
    return response.data.data
  }
}

// ============================================================
// SERVICIOS PARA USUARIOS (CRUD Completo)
// ============================================================
export const usuariosService = {
  // GET /api/usuarios - Obtener todos los usuarios activos
  getAll: async () => {
    const response = await api.get('/usuarios')
    return response.data.data
  },

  // GET /api/usuarios/:id - Obtener un usuario por ID
  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`)
    return response.data.data
  },

  // POST /api/usuarios - Crear nuevo usuario
  create: async (data) => {
    const response = await api.post('/usuarios', data)
    return response.data.data
  },

  // PUT /api/usuarios/:id - Actualizar usuario
  update: async (id, data) => {
    const response = await api.put(`/usuarios/${id}`, data)
    return response.data.data
  },

  // DELETE /api/usuarios/:id - Eliminación lógica
  delete: async (id) => {
    const response = await api.delete(`/usuarios/${id}`)
    return response.data
  },

  // DELETE /api/usuarios/:id/hard - Eliminación física (usar con precaución)
  hardDelete: async (id) => {
    const response = await api.delete(`/usuarios/${id}/hard`)
    return response.data
  },

  // GET /api/usuarios/search?q=texto - Buscar usuarios por nombre, apellido o email
  search: async (query) => {
    const response = await api.get(`/usuarios/search?q=${encodeURIComponent(query)}`)
    return response.data.data
  },

  // GET /api/usuarios/role/:roleId - Obtener usuarios por rol
  getByRole: async (roleId) => {
    const response = await api.get(`/usuarios/role/${roleId}`)
    return response.data.data
  },

  // GET /api/usuarios/institution/:institutionId - Obtener usuarios por institución
  getByInstitution: async (institutionId) => {
    const response = await api.get(`/usuarios/institution/${institutionId}`)
    return response.data.data
  }
}

// ============================================================
// SERVICIOS PARA DOCUMENTOS (CRUD Completo)
// ============================================================
export const documentosService = {
  // GET /api/documentos - Obtener todos los documentos activos
  getAll: async () => {
    const response = await api.get('/documentos')
    return response.data.data
  },

  // GET /api/documentos/:id - Obtener un documento por ID
  getById: async (id) => {
    const response = await api.get(`/documentos/${id}`)
    return response.data.data
  },

  // POST /api/documentos - Crear nuevo documento
  create: async (data) => {
    const response = await api.post('/documentos', data)
    return response.data.data
  },

  // PUT /api/documentos/:id - Actualizar documento
  update: async (id, data) => {
    const response = await api.put(`/documentos/${id}`, data)
    return response.data.data
  },

  // DELETE /api/documentos/:id - Eliminación lógica
  delete: async (id) => {
    const response = await api.delete(`/documentos/${id}`)
    return response.data
  },

  // DELETE /api/documentos/:id/hard - Eliminación física (usar con precaución)
  hardDelete: async (id) => {
    const response = await api.delete(`/documentos/${id}/hard`)
    return response.data
  },

  // GET /api/documentos/search?q=texto - Buscar documentos por nombre o tipo
  search: async (query) => {
    const response = await api.get(`/documentos/search?q=${encodeURIComponent(query)}`)
    return response.data.data
  },

  // GET /api/documentos/institution/:institutionId - Obtener documentos por institución
  getByInstitution: async (institutionId) => {
    const response = await api.get(`/documentos/institution/${institutionId}`)
    return response.data.data
  },

  // GET /api/documentos/owner/:userId - Obtener documentos por propietario
  getByOwner: async (userId) => {
    const response = await api.get(`/documentos/owner/${userId}`)
    return response.data.data
  },

  // GET /api/documentos/type/:type - Obtener documentos por tipo
  getByType: async (type) => {
    const response = await api.get(`/documentos/type/${type}`)
    return response.data.data
  }
}

export default exampleService
