import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseAuth'
import { usuariosService } from '../services/supabaseClient'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validaciones básicas
      if (!formData.email || !formData.password) {
        throw new Error('Email y contraseña son requeridos')
      }

      // Autenticación real con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (authError) {
        console.error('❌ Error de Supabase Auth:', authError)
        console.error('   - Código:', authError.status)
        console.error('   - Mensaje:', authError.message)
        console.error('   - Detalles:', authError)
        
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Debes confirmar tu email antes de iniciar sesión')
        }
        throw new Error('Email o contraseña incorrectos')
      }

      console.log('✅ Sesión de Supabase creada:', authData.user.email)

      // Buscar datos del usuario en la tabla usuarios usando Supabase directo
      try {
        console.log('🔍 Obteniendo usuarios desde Supabase...')
        const usuarios = await usuariosService.getAll()
        
        console.log('📋 Total usuarios recibidos:', usuarios.length)
        console.log('📋 Primer usuario:', usuarios[0])
        
        const usuario = usuarios.find(u => 
          u.email.toLowerCase() === formData.email.toLowerCase()
        )
        
        console.log('👤 Usuario encontrado:', usuario)
        console.log('🎭 Rol del usuario:', usuario?.role)
        console.log('🎭 Tipo de rol:', typeof usuario?.role)
        console.log('🎭 role.name:', usuario?.role?.name)
        
        if (usuario) {
          // Guardar usuario completo en localStorage
          const userToSave = { 
            email: usuario.email,
            userId: usuario.userId,
            name: usuario.name,
            surname: usuario.surname,
            institution: usuario.institution, // Agregar institución
            role: usuario.role
          }
          
          console.log('💾 Guardando en localStorage:', userToSave)
          console.log('💾 role enriquecido:', JSON.stringify(userToSave.role))
          localStorage.setItem('user', JSON.stringify(userToSave))
          console.log('✅ Usuario guardado en localStorage')
          console.log('Usuario autenticado:', usuario.name, usuario.surname)
        } else {
          // Si no existe en la tabla usuarios, guardar solo datos de auth
          localStorage.setItem('user', JSON.stringify({ 
            email: authData.user.email,
            userId: authData.user.id
          }))
        }
      } catch (err) {
        console.error('Error buscando usuario en BD:', err)
        // Guardar al menos el email del auth
        localStorage.setItem('user', JSON.stringify({ 
          email: authData.user.email,
          userId: authData.user.id
        }))
      }

      // Redirigir a documentos
      navigate('/documentos')
    } catch (err) {
      setError(err.message || 'Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterClick = () => {
    navigate('/register')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">🔐</div>
            <h1>Iniciar Sesión</h1>
            <p>Accede para gestionar documentos</p>
          </div>

          {error && (
            <div className="error-banner">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                <span className="label-icon">📧</span>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@ejemplo.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span className="label-icon">🔒</span>
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-login"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="login-divider">
            <span>o</span>
          </div>

          <button 
            onClick={handleRegisterClick}
            className="btn btn-secondary btn-register"
            type="button"
          >
            <span>➕</span>
            Crear Usuario Nuevo
          </button>

          <div className="login-footer">
            <p className="help-text">
              💡 Los documentos públicos pueden verse sin iniciar sesión
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
