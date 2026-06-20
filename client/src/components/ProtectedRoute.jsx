import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredPermission }) => {
    const { sesion, cargando, tienePermiso } = useAuth();

    if (cargando) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh' 
            }}>
                <p>Cargando...</p>
            </div>
        );
    }

    if (!sesion) {
        return <Navigate to="/login" replace />;
    }

    if (requiredPermission && !tienePermiso(requiredPermission)) {
        return (
            <main>
                <div className="acceso-denegado" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <i className="ph ph-lock-key" style={{ fontSize: '4rem', color: 'var(--text-light)' }}></i>
                    <h2>Acceso denegado</h2>
                    <p>No tenés permisos para acceder a esta sección.</p>
                    <a href="/" className="btn btn-primary">Volver al inicio</a>
                </div>
            </main>
        );
    }

    return children;
};

export default ProtectedRoute;
