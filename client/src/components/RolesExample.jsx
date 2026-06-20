import { useState, useEffect } from 'react'
import { rolesService } from '../services/supabaseClient'
import './RolesExample.css'

/**
 * Componente de ejemplo que muestra cómo usar los roles
 * en un formulario con un select/dropdown
 */
function RolesExample() {
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      // Usa getAll() para obtener todos los roles activos
      const data = await rolesService.getAll()
      setRoles(data)
      setError(null)
    } catch (err) {
      setError('Error al cargar los roles: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!selectedRole) {
      alert('Por favor selecciona un rol')
      return
    }

    // Buscar el rol completo
    const role = roles.find(r => r.roleId === selectedRole)
    
    console.log('Rol seleccionado:', role)
    alert(`Has seleccionado: ${role.name}`)
    
    // Aquí harías el POST/PUT con el roleId
    // Ejemplo: await api.create({ name: 'Juan', roleId: selectedRole })
  }

  return (
    <div className="roles-example">
      <div className="container">
        <h2>Ejemplo: Selector de Roles</h2>
        <p className="subtitle">
          Los roles se cargan desde la base de datos y se pueden usar en cualquier formulario
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="role">Selecciona un Rol:</label>
              
              {loading ? (
                <div className="loading-select">Cargando roles...</div>
              ) : (
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                  className="select-input"
                >
                  <option value="">-- Selecciona un rol --</option>
                  {roles.map((role) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              Enviar
            </button>
          </form>
        </div>

        {/* Mostrar lista de roles disponibles */}
        <div className="card">
          <h3>Roles Disponibles</h3>
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : roles.length === 0 ? (
            <p className="empty-message">
              No hay roles configurados. Agrégalos desde Supabase.
            </p>
          ) : (
            <div className="roles-grid">
              {roles.map((role) => (
                <div key={role.roleId} className="role-card">
                  <span className="role-icon">👤</span>
                  <span className="role-name">{role.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RolesExample
