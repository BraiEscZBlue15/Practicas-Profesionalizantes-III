import { useState, useEffect } from 'react'
import { usuariosService, institucionesService, rolesService } from '../../services/supabaseClient'
import './SeccionGestionUsuarios.css'

function SeccionGestionUsuarios() {
  const [instituciones, setInstituciones] = useState([])
  const [roles, setRoles] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [selectedInstitution, setSelectedInstitution] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [approvalData, setApprovalData] = useState({}) // { userId: roleId }
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    role: '',
    institution: '',
    pending: false,
    active: true,
    message: ''
  })

  // Cargar instituciones y roles al montar
  useEffect(() => {
    loadInitialData()
  }, [])

  // Cargar usuarios cuando cambia la institución seleccionada
  useEffect(() => {
    if (selectedInstitution) {
      loadUsuariosByInstitution()
    } else {
      setUsuarios([])
    }
  }, [selectedInstitution])

  const loadInitialData = async () => {
    try {
      const [instData, rolesData] = await Promise.all([
        institucionesService.getAll(),
        rolesService.getAll()
      ])
      setInstituciones(instData)
      setRoles(rolesData)
    } catch (err) {
      console.error('Error cargando datos iniciales:', err)
      setError('Error al cargar instituciones y roles')
    }
  }

  const loadUsuariosByInstitution = async () => {
    setLoading(true)
    setError('')
    try {
      const allUsers = await usuariosService.getAll()
      // Filtrar por institución seleccionada
      const filteredUsers = allUsers.filter(user => 
        user.institution?.institutionId === selectedInstitution
      )
      setUsuarios(filteredUsers)
    } catch (err) {
      console.error('Error cargando usuarios:', err)
      setError('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user.userId)
    setFormData({
      name: user.name || '',
      surname: user.surname || '',
      email: user.email || '',
      role: user.role?.roleId || '',
      institution: user.institution?.institutionId || '',
      pending: user.pending || false,
      active: user.active !== false,
      message: user.message || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      surname: '',
      email: '',
      role: '',
      institution: '',
      pending: false,
      active: true,
      message: ''
    })
  }

  const handleSave = async (userId) => {
    setLoading(true)
    setError('')
    try {
      const updateData = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim(),
        role: formData.role,
        institution: formData.institution || null,
        pending: formData.pending,
        active: formData.active,
        modifiedAt: new Date().toISOString()
      }

      await usuariosService.update(userId, updateData)
      
      // Recargar usuarios
      await loadUsuariosByInstitution()
      
      // Limpiar formulario
      handleCancelEdit()
    } catch (err) {
      console.error('Error actualizando usuario:', err)
      setError('Error al actualizar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await usuariosService.update(userId, {
        active: !currentActive,
        modifiedAt: new Date().toISOString()
      })
      await loadUsuariosByInstitution()
    } catch (err) {
      console.error('Error cambiando estado:', err)
      setError('Error al cambiar estado del usuario')
    }
  }

  const handleApprovePending = async (userId) => {
    try {
      const selectedRole = approvalData[userId]
      if (!selectedRole) {
        setError('Por favor, selecciona un rol antes de aprobar al usuario')
        return
      }

      await usuariosService.update(userId, {
        pending: false,
        role: selectedRole,
        modifiedAt: new Date().toISOString()
      })
      
      // Limpiar el rol seleccionado del estado
      setApprovalData(prev => {
        const newData = { ...prev }
        delete newData[userId]
        return newData
      })
      
      await loadUsuariosByInstitution()
    } catch (err) {
      console.error('Error aprobando usuario:', err)
      setError('Error al aprobar usuario')
    }
  }

  const handleRoleChangeForApproval = (userId, roleId) => {
    setApprovalData(prev => ({
      ...prev,
      [userId]: roleId
    }))
  }

  return (
    <div className="seccion-gestion-usuarios">
      <div className="seccion-header">
        <h2>👥 Gestión de Usuarios</h2>
        <p>Administra los usuarios registrados por institución</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filtro por Institución */}
      <div className="filtros-container">
        <div className="form-group">
          <label htmlFor="institution-filter">
            <span className="label-icon">🏫</span>
            Seleccionar Institución
          </label>
          <select
            id="institution-filter"
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
          >
            <option value="">-- Seleccione una institución --</option>
            {instituciones.map((inst) => (
              <option key={inst.institutionId} value={inst.institutionId}>
                {inst.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {selectedInstitution && (
        <div className="usuarios-table-container">
          {loading ? (
            <div className="loading">
              <p>Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="empty-state">
              <p>No hay usuarios registrados en esta institución</p>
            </div>
          ) : (
            <table className="usuarios-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Mensaje</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
              <tbody>
                {usuarios.map((user) => {
                  const isEditing = editingUser === user.userId
                  const isPending = user.pending === true
                  
                  const rowClassName = isPending ? 'pending-row' : (isEditing ? 'editing-row' : '')
                  
                  return (
                    <tr key={user.userId} className={rowClassName}>
                      {isEditing ? (
                        <>
                          {/* Modo Edición */}
                          <td style={{ padding: '0.75rem' }}>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              style={{ 
                                width: '100%', 
                                padding: '0.5rem',
                                border: '2px solid #2563eb',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <input
                              type="text"
                              value={formData.surname}
                              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                              style={{ 
                                width: '100%', 
                                padding: '0.5rem',
                                border: '2px solid #2563eb',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              style={{ 
                                width: '100%', 
                                padding: '0.5rem',
                                border: '2px solid #2563eb',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <select
                              value={formData.role}
                              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                              style={{ 
                                width: '100%', 
                                padding: '0.5rem',
                                border: '2px solid #2563eb',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                backgroundColor: 'white'
                              }}
                            >
                              <option value="">Sin rol</option>
                              {roles.map((role) => (
                                <option key={role.roleId} value={role.roleId}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              <input
                                type="checkbox"
                                checked={!formData.pending}
                                onChange={(e) => setFormData({ ...formData, pending: !e.target.checked })}
                              />
                              <span style={{ fontSize: '0.85rem' }}>
                                {formData.pending ? '⏳ Pendiente' : '✅ Aprobado'}
                              </span>
                            </label>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            {user.message && (
                              <button
                                type="button"
                                onClick={() => alert(user.message)}
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '0.85rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Ver
                              </button>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleSave(user.userId)}
                                disabled={loading}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: loading ? 'not-allowed' : 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: '500',
                                  transition: 'all 0.2s',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  opacity: loading ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                  if (!loading) {
                                    e.currentTarget.style.backgroundColor = '#059669'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!loading) {
                                    e.currentTarget.style.backgroundColor = '#10b981'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                  }
                                }}
                              >
                                💾 Guardar
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: '#6b7280',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: '500',
                                  transition: 'all 0.2s',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#4b5563'
                                  e.currentTarget.style.transform = 'translateY(-1px)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#6b7280'
                                  e.currentTarget.style.transform = 'translateY(0)'
                                }}
                              >
                                ❌ Cancelar
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Modo Visualización */}
                          <td style={{ padding: '0.9rem 0.75rem', fontSize: '0.95rem' }}>{user.name}</td>
                          <td style={{ padding: '0.9rem 0.75rem', fontSize: '0.95rem' }}>{user.surname}</td>
                          <td style={{ padding: '0.9rem 0.75rem', fontSize: '0.95rem', color: '#555' }}>{user.email}</td>
                          <td style={{ padding: '0.9rem 0.75rem', fontSize: '0.95rem' }}>
                            {user.role?.name ? (
                              <span style={{
                                padding: '0.3rem 0.8rem',
                                backgroundColor: '#e0e7ff',
                                color: '#3730a3',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                              }}>
                                {user.role.name}
                              </span>
                            ) : (
                              <span style={{ color: '#999', fontSize: '0.85rem' }}>Sin rol</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            {isPending ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ 
                                  padding: '0.25rem 0.75rem',
                                  backgroundColor: '#ffc107',
                                  color: '#000',
                                  borderRadius: '12px',
                                  fontSize: '0.85rem',
                                  fontWeight: 'bold'
                                }}>
                                  ⏳ Pendiente
                                </span>
                                <select
                                  value={approvalData[user.userId] || ''}
                                  onChange={(e) => handleRoleChangeForApproval(user.userId, e.target.value)}
                                  style={{
                                    padding: '0.4rem',
                                    fontSize: '0.85rem',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    width: '100%',
                                    maxWidth: '150px'
                                  }}
                                >
                                  <option value="">Seleccionar rol...</option>
                                  {roles.map((role) => (
                                    <option key={role.roleId} value={role.roleId}>
                                      {role.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <span style={{ 
                                padding: '0.25rem 0.75rem',
                                backgroundColor: user.active ? '#28a745' : '#dc3545',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '0.85rem'
                              }}>
                                {user.active ? '✅ Activo' : '❌ Inactivo'}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>
                            {user.message ? (
                              <button
                                type="button"
                                onClick={() => alert(`Mensaje de solicitud:\n\n${user.message}`)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontWeight: '500',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#2563eb'
                                  e.currentTarget.style.transform = 'translateY(-1px)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#3b82f6'
                                  e.currentTarget.style.transform = 'translateY(0)'
                                }}
                              >
                                📝 Ver mensaje
                              </button>
                            ) : (
                              <span style={{ color: '#999', fontSize: '0.85rem' }}>Sin mensaje</span>
                            )}
                          </td>
                          <td style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleEdit(user)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: '500',
                                  transition: 'all 0.2s',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#2563eb'
                                  e.currentTarget.style.transform = 'translateY(-1px)'
                                  e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#3b82f6'
                                  e.currentTarget.style.transform = 'translateY(0)'
                                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                              >
                                ✏️ Editar
                              </button>
                              {isPending && (
                                <button
                                  onClick={() => handleApprovePending(user.userId)}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#059669'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#10b981'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  ✅ Aprobar
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleActive(user.userId, user.active)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: user.active ? '#f59e0b' : '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: '500',
                                  transition: 'all 0.2s',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = '0.85'
                                  e.currentTarget.style.transform = 'translateY(-1px)'
                                  e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = '1'
                                  e.currentTarget.style.transform = 'translateY(0)'
                                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                              >
                                {user.active ? '🚫 Desactivar' : '✅ Activar'}
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!selectedInstitution && (
        <div className="empty-state">
          <p>👆 Selecciona una institución para ver sus usuarios</p>
        </div>
      )}
    </div>
  )
}

export default SeccionGestionUsuarios
