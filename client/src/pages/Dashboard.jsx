import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { inicializarDatosDefault } from '../data/defaultData'
import SeccionInicio from '../components/admin/SeccionInicio'
import SeccionContactos from '../components/admin/SeccionContactos'
import SeccionPlanos from '../components/admin/SeccionPlanos'
import SeccionProtocolos from '../components/admin/SeccionProtocolos'
import SeccionRecursos from '../components/admin/SeccionRecursos'
import SeccionGestionUsuarios from '../components/admin/SeccionGestionUsuarios'
import '../../assets/css/dashboard.css'

function Dashboard() {
  const [seccionActiva, setSeccionActiva] = useState('inicio')
  const { sesion } = useAuth()

  useEffect(() => {
    inicializarDatosDefault()
  }, [])

  const renderizarSeccion = () => {
    switch (seccionActiva) {
      case 'inicio':
        return <SeccionInicio />
      case 'planos':
        return <SeccionPlanos />
      case 'contactos':
        return <SeccionContactos />
      case 'protocolos':
        return <SeccionProtocolos />
      case 'recursos':
        return <SeccionRecursos />
      case 'gestion-usuarios':
        return <SeccionGestionUsuarios />
      default:
        return <SeccionInicio />
    }
  }

  return (
    <div className="dashboard-page">
      <main className="dashboard-main container">
        <div className="dashboard-view">
          {/* Sidebar */}
          <aside className="sidebar">
            <nav className="sidebar-nav">
              <span className="sidebar-label">Panel de Control</span>
              <button 
                className={`sidebar-btn ${seccionActiva === 'inicio' ? 'active' : ''}`}
                onClick={() => setSeccionActiva('inicio')}
              >
                <i className="ph ph-house"></i> Inicio
              </button>
              
              <span className="sidebar-label" style={{ marginTop: '1rem' }}>Contenido</span>
              <button 
                className={`sidebar-btn ${seccionActiva === 'planos' ? 'active' : ''}`}
                onClick={() => setSeccionActiva('planos')}
              >
                <i className="ph ph-map-pin"></i> Planos
              </button>
              <button 
                className={`sidebar-btn ${seccionActiva === 'contactos' ? 'active' : ''}`}
                onClick={() => setSeccionActiva('contactos')}
              >
                <i className="ph ph-phone-call"></i> Contactos
              </button>
              <button 
                className={`sidebar-btn ${seccionActiva === 'protocolos' ? 'active' : ''}`}
                onClick={() => setSeccionActiva('protocolos')}
              >
                <i className="ph ph-clipboard-text"></i> Protocolos
              </button>
              <button 
                className={`sidebar-btn ${seccionActiva === 'recursos' ? 'active' : ''}`}
                onClick={() => setSeccionActiva('recursos')}
              >
                <i className="ph ph-book-open"></i> Recursos
              </button>
              
              <span className="sidebar-label" style={{ marginTop: '1rem' }}>Administración</span>
              <button 
                className={`sidebar-btn ${seccionActiva === 'gestion-usuarios' ? 'active' : ''}`}
                onClick={() => setSeccionActiva('gestion-usuarios')}
              >
                <i className="ph ph-users"></i> Gestión de Usuarios
              </button>
            </nav>
          </aside>

          {/* Contenido Principal */}
          <div className="dashboard-content">
            {renderizarSeccion()}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

