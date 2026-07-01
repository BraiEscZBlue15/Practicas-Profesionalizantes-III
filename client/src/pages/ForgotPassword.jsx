import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/supabaseAuth'
import './Login.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email.trim()) {
        throw new Error('El email es requerido')
      }

      const redirectTo = `${window.location.origin}/update-password`
      await authService.resetPassword(email.trim().toLowerCase(), redirectTo)
      setSent(true)
    } catch (submitError) {
      setError(submitError.message || 'No se pudo enviar el correo de recuperación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">🔐</div>
            <h1>Recuperar Contraseña</h1>
            <p>Te enviaremos un enlace para restablecerla</p>
          </div>

          {error && (
            <div className="error-banner">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {sent ? (
            <div className="login-footer" style={{ marginTop: '0' }}>
              <p className="help-text">✅ Revisa tu correo y abre el enlace de recuperación.</p>
              <button
                type="button"
                className="btn btn-secondary btn-register"
                onClick={() => navigate('/login')}
              >
                Volver al Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="recovery-email">
                  <span className="label-icon">📧</span>
                  Email
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-register"
                onClick={() => navigate('/login')}
              >
                Volver al Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
