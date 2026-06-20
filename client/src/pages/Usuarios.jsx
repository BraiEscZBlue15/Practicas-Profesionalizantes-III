import { useState, useEffect } from 'react'
import { usuariosService, rolesService, institucionesService } from '../services/supabaseClient'
import './Usuarios.css'

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [instituciones, setInstituciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estado del formulario
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    role: '',
    institution: ''
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [usuariosData, rolesData, institucionesData] = await Promise.all([
        usuariosService.getAll(),
        rolesService.getAll(),
        institucionesService.getAll()
      ])
      setUsuarios(usuariosData)
      setRoles(rolesData)
      setInstituciones(institucionesData)
      setError(null)
    } catch (err) {
      setError('Error al cargar datos: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsuarios = async () => {
    try {
      const data = await usuariosService.getAll()
      setUsuarios(data)
      setError(null)
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message)
    }
  }

  const handleSearch = async (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim() === '') {
      fetchUsuarios()
      return
    }

    try {
      const data = await usuariosService.search(value)
      setUsuarios(data)
      setError(null)
    } catch (err) {
      setError('Error en la búsqueda: ' + err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const submitData = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        role: formData.role || null,
        institution: formData.institution || null
      }

      if (editingId) {
        await usuariosService.update(editingId, submitData)
      } else {
        await usuariosService.create(submitData)
      }

      // Limpiar y recargar
      setFormData({ name: '', surname: '', email: '', role: '', institution: '' })
      setEditingId(null)
      setShowForm(false)
      fetchUsuarios()
    } catch (err) {
      setError(`Error al ${editingId ? 'actualizar' : 'crear'} usuario: ${err.response?.data?.error || err.message}`)
    }
  }

  const handleEdit = (usuario) => {
    setFormData({
      name: usuario.name,
      surname: usuario.surname,
      email: usuario.email,
      role: usuario.role?.roleId || '',
      institution: usuario.institution?.institutionId || ''
    })
    setEditingId(usuario.userId)
    setShowForm(true)
  }

  const handleDelete = async (id, name, surname) => {
    if (!confirm(`¿Estás seguro de eliminar a ${name} ${surname}?`)) return

    try {
      await usuariosService.delete(id)
      fetchUsuarios()
    } catch (err) {
      setError('Error al eliminar: ' + err.message)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', surname: '', email: '', role: '', institution: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleNewClick = () => {
    setFormData({ name: '', surname: '', email: '', role: '', institution: '' })
    setEditingId(null)
    setShowForm(true)
  }

  return (
    <div className="usuarios-page">
      <div className="container">
        <div className="page-header">
          <h1>Gestión de Usuarios</h1>
          <button 
            onClick={handleNewClick}
            className="btn btn-primary"
          >
            + Nuevo Usuario
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="close-btn">×</button>
          </div>
        )}

        {/* Formulario de Creación/Edición */}
        {showForm && (
          <div className="card form-card">
            <h2>{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nombre *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ej: Juan"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="surname">Apellido *</label>
                  <input
                    type="text"
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    required
                    placeholder="Ej: Pérez"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Rol</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="">Seleccionar rol...</option>
                    {roles.map((rol) => (
                      <option key={rol.roleId} value={rol.roleId}>
                        {rol.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="institution">Institución</label>
                  <select
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  >
                    <option value="">Seleccionar institución...</option>
                    {instituciones.map((inst) => (
                      <option key={inst.institutionId} value={inst.institutionId}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Barra de Búsqueda */}
        <div className="card search-card">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o email..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm('')
                  fetchUsuarios()
                }}
                className="clear-search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="card">
          <div className="card-header">
            <h2>Usuarios Registrados</h2>
            <span className="count-badge">
              {usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'}
            </span>
          </div>

          {loading ? (
            <div className="loading">Cargando usuarios...</div>
          ) : usuarios.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">👥</span>
              <p>
                {searchTerm 
                  ? 'No se encontraron resultados para tu búsqueda'
                  : 'No hay usuarios registrados. ¡Crea el primero!'}
              </p>
            </div>
          ) : (
            <div className="usuarios-table-wrapper">
              <table className="usuarios-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Institución</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.userId}>
                      <td>{usuario.name}</td>
                      <td>{usuario.surname}</td>
                      <td className="email-cell">{usuario.email}</td>
                      <td>
                        {usuario.role ? (
                          <span className="badge badge-role">{usuario.role.name}</span>
                        ) : (
                          <span className="badge badge-empty">Sin rol</span>
                        )}
                      </td>
                      <td className="institution-cell">
                        {usuario.institution?.name || '-'}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="btn-action btn-edit"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(usuario.userId, usuario.name, usuario.surname)}
                            className="btn-action btn-delete"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Usuarios
