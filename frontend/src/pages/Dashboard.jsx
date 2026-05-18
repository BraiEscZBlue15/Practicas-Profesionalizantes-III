import { useState, useEffect } from 'react'
import api from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await api.getAll()
      setItems(data)
      setError(null)
    } catch (err) {
      setError('Error al cargar los datos: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.create(formData)
      setFormData({ name: '', description: '' })
      fetchItems() // Recargar la lista
    } catch (err) {
      setError('Error al crear el registro: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return
    
    try {
      await api.delete(id)
      fetchItems() // Recargar la lista
    } catch (err) {
      setError('Error al eliminar: ' + err.message)
    }
  }

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Dashboard</h1>
        
        {/* Formulario de Creación */}
        <div className="card">
          <h2>Crear Nuevo Registro</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="name">Nombre:</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ingresa un nombre"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción:</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional"
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-primary">Crear</button>
          </form>
        </div>

        {/* Lista de Registros */}
        <div className="card">
          <h2>Registros Existentes</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : items.length === 0 ? (
            <p className="empty-message">No hay registros aún. ¡Crea el primero!</p>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item.id} className="item-card">
                  <h3>{item.name}</h3>
                  <p>{item.description || 'Sin descripción'}</p>
                  <div className="item-footer">
                    <small>ID: {item.id}</small>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="btn-delete"
                    >
                      Eliminar
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

export default Dashboard
