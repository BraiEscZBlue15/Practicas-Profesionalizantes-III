import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usuariosService, institucionesService } from '../services/api'
import { supabase } from '../services/supabaseAuth'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const [instituciones, setInstituciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [publicoRoleId, setPublicoRoleId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: ''
  })

  // Cargar instituciones y buscar el rol 'publico'
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar instituciones
        const institucionesData = await institucionesService.getAll()
        setInstituciones(institucionesData)
        
        // Buscar el rol 'publico' por su nombre
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/roles/active`)
        const rolesData = await response.json()
        const publicoRole = rolesData.data?.find(r => r.roleName.toLowerCase() === 'publico')
        if (publicoRole) {
          setPublicoRoleId(publicoRole.roleId)
        }
      } catch (err) {
        console.error('Error cargando datos:', err)
      }
    }
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validaciones
      if (!formData.name.trim() || !formData.surname.trim()) {
        throw new Error('Nombre y apellido son requeridos')
      }

      if (!formData.email.trim()) {
        throw new Error('El email es requerido')
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error('El formato del email no es válido')
      }

      if (!formData.password || formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      // PASO 1: Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          user_metadata: {
            name: formData.name.trim(),
            surname: formData.surname.trim()
          }
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      console.log('✅ Usuario creado en Supabase Auth:', authData.user.email)

      // PASO 2: Crear usuario en la tabla usuarios con el mismo ID
      const newUser = {
        userId: authData.user.id, // Usar el mismo ID de Supabase Auth
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim().toLowerCase(),
        role: publicoRoleId,
        institution: formData.institution && formData.institution.trim() ? formData.institution.trim() : null
      }

      console.log('Creando usuario en tabla usuarios:', newUser)
      await usuariosService.create(newUser)

      console.log('✅ Usuario sincronizado en ambas tablas')
      setSuccess(true)
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      console.error('Error en registro:', err)
      setError(err.response?.data?.error || err.message || 'Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  if (success) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h1>¡Usuario Creado!</h1>
            <p>Tu cuenta ha sido creada exitosamente.</p>
            <p className="redirect-text">Redirigiendo al inicio de sesión...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-icon">👤</div>
            <h1>Crear Usuario Nuevo</h1>
            <p>Completa el formulario para registrarte</p>
          </div>

          {error && (
            <div className="error-banner">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan"
                  required
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
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <span className="label-icon">📧</span>
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  <span className="label-icon">🔒</span>
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <span className="label-icon">🔒</span>
                  Confirmar *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repetir contraseña"
                  required
                />
              </div>
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

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creando usuario...' : 'Crear Usuario'}
              </button>
              <button 
                type="button" 
                onClick={handleBackToLogin}
                className="btn btn-secondary"
              >
                Volver al Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
