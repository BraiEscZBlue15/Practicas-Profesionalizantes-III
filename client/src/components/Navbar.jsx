import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const { user, esAdministrador, cerrarSesion } = useAuth()

  const handleAuthClick = async () => {
    if (user) {
      await cerrarSesion()
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
          {esAdministrador && (
            <li>
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
            </li>
          )}
          {esAdministrador && (
            <li>
              <Link to="/roles" className="navbar-link">Roles</Link>
            </li>
          )}
          <li>
            <Link to="/instituciones" className="navbar-link">Instituciones</Link>
          </li>
          {esAdministrador && (
            <li>
              <Link to="/usuarios" className="navbar-link">Usuarios</Link>
            </li>
          )}
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
