import './Home.css'

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenido a Escuelas Seguras</h1>
          <p>Sistema integral de protección para instituciones educativas</p>
          <div className="hero-buttons">
            <button className="btn btn-primary">Conocer Más</button>
            <button className="btn btn-secondary">Solicitar Demo</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-graphic">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#2563eb" strokeWidth="2"/>
              <circle cx="100" cy="100" r="60" fill="none" stroke="#2563eb" strokeWidth="1" opacity="0.5"/>
              <path d="M 100 40 L 130 70 L 120 70 L 120 140 L 80 140 L 80 70 L 70 70 Z" fill="#2563eb"/>
            </svg>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Características Principales</h2>
        <div className="features-grid">
          <div className="card">
            <div className="feature-icon">📹</div>
            <h3>Monitoreo 24/7</h3>
            <p>Vigilancia continua con cámaras integradas</p>
          </div>
          <div className="card">
            <div className="feature-icon">🚨</div>
            <h3>Alertas Inmediatas</h3>
            <p>Notificaciones ante cualquier incidente</p>
          </div>
          <div className="card">
            <div className="feature-icon">👥</div>
            <h3>Control de Acceso</h3>
            <p>Gestión de entradas y salidas segura</p>
          </div>
          <div className="card">
            <div className="feature-icon">📊</div>
            <h3>Reportes Detallados</h3>
            <p>Análisis y estadísticas en tiempo real</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
