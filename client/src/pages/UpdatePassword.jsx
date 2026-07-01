import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, authService } from '../services/supabaseAuth'
import './Login.css'

function UpdatePassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [updated, setUpdated] = useState(false)

  useEffect(() => {
    const validateRecoverySession = async () => {
      setError('')
      const { data, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        setError('No se pudo validar el enlace de recuperación')
        return
      }

      if (!data.session) {
        setError('El enlace de recuperación es inválido o expiró')
        return
      }

      setReady(true)
    }

    validateRecoverySession()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      if (!password || password.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres')
      }

      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      setLoading(true)
      await authService.updatePassword(password)
      setUpdated(true)
      setPassword('')
      setConfirmPassword('')
    } catch (submitError) {
      setError(submitError.message || 'No se pudo actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">🛡️</div>
            <h1>Nueva Contraseña</h1>
            <p>Ingresa y confirma tu nueva contraseña</p>
          </div>

          {error && (
            <div className="error-banner">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {updated ? (
            <div className="login-footer" style={{ marginTop: '0' }}>
              <p className="help-text">✅ Contraseña actualizada correctamente.</p>
              <button
                type="button"
                className="btn btn-primary btn-login"
                onClick={() => navigate('/login')}
              >
                Ir al Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="new-password">
                  <span className="label-icon">🔒</span>
                  Nueva contraseña
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  disabled={!ready}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-new-password">
                  <span className="label-icon">🔒</span>
                  Confirmar contraseña
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repite la nueva contraseña"
                  minLength={6}
                  required
                  disabled={!ready}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-login"
                disabled={loading || !ready}
              >
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default UpdatePassword
