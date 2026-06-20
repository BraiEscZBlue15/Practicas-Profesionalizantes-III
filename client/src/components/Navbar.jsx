import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseAuth'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Verificar si hay usuario en localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Error parsing user:', e)
      }
    }
  }, [])

  const handleAuthClick = async () => {
    if (user) {
      // Cerrar sesión de Supabase y localStorage
      await supabase.auth.signOut()
      localStorage.removeItem('user')
      setUser(null)
      navigate('/')
      console.log('✅ Sesión cerrada')
    } else {
      // Ir al login
      navigate('/login')
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛡️</span>
          <span>Escuelas Seguras</span>
        </Link>
        
        <ul className="navbar-menu">
          <li>
            <Link to="/" className="navbar-link">Inicio</Link>
          </li>
          <li>
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          </li>
          <li>
            <Link to="/roles" className="navbar-link">Roles</Link>
          </li>
          <li>
            <Link to="/instituciones" className="navbar-link">Instituciones</Link>
          </li>
          <li>
            <Link to="/usuarios" className="navbar-link">Usuarios</Link>
          </li>
          <li>
            <Link to="/documentos" className="navbar-link">Documentos</Link>
          </li>
        </ul>

        <div className="navbar-auth">
          {user && (
            <span className="navbar-user">
              👤 {user.email}
            </span>
          )}
          <button onClick={handleAuthClick} className="navbar-button">
            {user ? 'Cerrar Sesión' : 'Ingresar'}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
