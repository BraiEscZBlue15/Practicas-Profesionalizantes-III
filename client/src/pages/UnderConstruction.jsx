import { useNavigate } from 'react-router-dom'
import './UnderConstruction.css'

function UnderConstruction() {
  const navigate = useNavigate()

  return (
    <div className="under-construction-container">
      {/* Background ambient glowing spheres */}
      <div className="ambient-sphere sphere-primary"></div>
      <div className="ambient-sphere sphere-secondary"></div>

      <div className="under-construction-card">
        {/* Animated Icon Container */}
        <div className="icon-container">
          <svg className="construction-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            {/* Outer gear */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary-color)" strokeWidth="4" strokeDasharray="10 6" className="gear-outer" />
            
            {/* Inner shield indicating Escuelas Seguras theme */}
            <path d="M 50 25 C 62 25 70 30 70 30 C 70 30 70 55 50 75 C 30 55 30 30 30 30 C 30 30 38 25 50 25 Z" fill="none" stroke="var(--secondary-color)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Pulsing checkpoint / safe emblem */}
            <circle cx="50" cy="46" r="8" fill="var(--accent-color)" className="pulse-dot" />
            <path d="M 46 46 L 49 49 L 55 43" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Content */}
        <h1 className="construction-title">Sección en Construcción</h1>
        <p className="construction-subtitle">Estamos construyendo algo grandioso</p>
        
        <p className="construction-text">
          Para ofrecerte la mejor experiencia en la gestión y protección de instituciones educativas, 
          nuestro equipo está implementando nuevas herramientas de seguridad. ¡Próximamente estará disponible!
        </p>

        {/* Dynamic Progress indicator */}
        <div className="progress-section">
          <div className="progress-label">
            <span>Progreso de implementación</span>
            <span className="progress-percentage">75%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill"></div>
          </div>
          <p className="progress-status">Instalando módulos de seguridad y control...</p>
        </div>

        {/* Action Button */}
        <button className="btn btn-primary btn-back" onClick={() => navigate('/')}>
          Volver al Inicio
        </button>
      </div>
    </div>
  )
}

export default UnderConstruction
