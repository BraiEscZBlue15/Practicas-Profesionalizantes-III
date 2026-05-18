import { useState, useEffect } from 'react'
import { institucionesService } from '../services/api'
import './Instituciones.css'

function Instituciones() {
  const [instituciones, setInstituciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estado del formulario
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  })

  // Cargar instituciones al montar
  useEffect(() => {
    fetchInstituciones()
  }, [])

  const fetchInstituciones = async () => {
    try {
      setLoading(true)
      const data = await institucionesService.getAll()
      setInstituciones(data)
      setError(null)
    } catch (err) {
      setError('Error al cargar instituciones: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim() === '') {
      fetchInstituciones()
      return
    }

    try {
      const data = await institucionesService.search(value)
      setInstituciones(data)
      setError(null)
    } catch (err) {
      setError('Error en la búsqueda: ' + err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingId) {
        // Actualizar
        await institucionesService.update(editingId, formData)
      } else {
        // Crear
        await institucionesService.create(formData)
      }

      // Limpiar y recargar
      setFormData({ name: '', address: '' })
      setEditingId(null)
      setShowForm(false)
      fetchInstituciones()
    } catch (err) {
      setError(`Error al ${editingId ? 'actualizar' : 'crear'} institución: ${err.message}`)
    }
  }

  const handleEdit = (institucion) => {
    setFormData({
      name: institucion.name,
      address: institucion.address || ''
    })
    setEditingId(institucion.institutionId)
    setShowForm(true)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) return

    try {
      await institucionesService.delete(id)
      fetchInstituciones()
    } catch (err) {
      setError('Error al eliminar: ' + err.message)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', address: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleNewClick = () => {
    setFormData({ name: '', address: '' })
    setEditingId(null)
    setShowForm(true)
  }

  return (
    <div className="instituciones-page">
      <div className="container">
        <div className="page-header">
          <h1>Gestión de Instituciones</h1>
          <button 
            onClick={handleNewClick}
            className="btn btn-primary"
          >
            + Nueva Institución
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
            <h2>{editingId ? 'Editar Institución' : 'Nueva Institución'}</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="name">Nombre *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ej: Escuela Primaria N° 123"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Dirección</label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ej: Av. Principal 1234, Ciudad"
                />
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
              placeholder="Buscar por nombre o dirección..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm('')
                  fetchInstituciones()
                }}
                className="clear-search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Lista de Instituciones */}
        <div className="card">
          <div className="card-header">
            <h2>Instituciones Registradas</h2>
            <span className="count-badge">
              {instituciones.length} {instituciones.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {loading ? (
            <div className="loading">Cargando instituciones...</div>
          ) : instituciones.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🏫</span>
              <p>
                {searchTerm 
                  ? 'No se encontraron resultados para tu búsqueda'
                  : 'No hay instituciones registradas. ¡Crea la primera!'}
              </p>
            </div>
          ) : (
            <div className="instituciones-grid">
              {instituciones.map((inst) => (
                <div key={inst.institutionId} className="institucion-card">
                  <div className="institucion-header">
                    <h3>{inst.name}</h3>
                  </div>
                  
                  <div className="institucion-body">
                    {inst.address && (
                      <p className="institucion-address">
                        <span className="icon">📍</span>
                        {inst.address}
                      </p>
                    )}
                    
                    <div className="institucion-meta">
                      <small>Creada: {new Date(inst.createdAt).toLocaleDateString()}</small>
                    </div>
                  </div>

                  <div className="institucion-actions">
                    <button
                      onClick={() => handleEdit(inst)}
                      className="btn-action btn-edit"
                      title="Editar"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(inst.institutionId, inst.name)}
                      className="btn-action btn-delete"
                      title="Eliminar"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Instituciones
