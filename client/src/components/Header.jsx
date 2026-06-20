import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { sesion, cerrarSesion } = useAuth();

    return (
        <header className="header">
            <div className="container header-container">
                <Link to="/" className="logo">
                    <i className="ph ph-bank logo-icon"></i>
                    <span className="logo-text">Jefatura Distrital San Miguel</span>
                </Link>

                <nav className="nav" aria-label="Navegación principal">
                    <ul className="nav-list">
                        <li><Link to="/" className="nav-link">Inicio</Link></li>
                        <li><a href="#" className="nav-link">Documentos</a></li>
                        <li><a href="#" className="nav-link">Instituciones</a></li>
                        <li><a href="#" className="nav-link">Recursos</a></li>
                    </ul>
                </nav>

                <div className="header-actions" id="headerActions">
                    {sesion ? (
                        <>
                            <span className="user-display">{sesion.nombre}</span>
                            <button 
                                className="btn btn-sm btn-outline" 
                                onClick={cerrarSesion}
                                title="Cerrar sesión"
                            >
                                <i className="ph ph-sign-out"></i> Salir
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn-icon" aria-label="Buscar">
                                <i className="ph ph-magnifying-glass"></i>
                            </button>
                            <Link to="/login" className="btn btn-primary btn-sm">Acceso</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
