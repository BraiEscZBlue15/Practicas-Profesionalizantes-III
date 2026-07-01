import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PERMISOS } from '../data/constants';
import { supabase } from '../services/supabaseAuth';

export const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [sesion, setSesion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();
    const ADMIN_ROLES = ['administrador', 'admin'];

    useEffect(() => {
        verificarSesion();
    }, []);

    const verificarSesion = () => {
        // Obtener usuario de localStorage (ya enriquecido por Login.jsx)
        const userDataStr = localStorage.getItem('user');

        if (!userDataStr) {
            setCargando(false);
            return;
        }

        try {
            const userData = JSON.parse(userDataStr);
            
            // Normalizar nombre del rol (minúsculas para coincidir con PERMISOS)
            const rolNombre = (userData.role?.name || 'usuario').toLowerCase();
            
            // Mapear datos de Supabase al formato esperado por AuthContext
            const sesionData = {
                id: userData.userId,
                nombre: `${userData.name} ${userData.surname}`,
                rol: rolNombre, // nombre del rol normalizado
                email: userData.email,
                roleData: userData.role, // objeto completo del rol
                // Agregar datos completos del usuario para componentes que lo necesiten
                userData: userData // objeto completo de Supabase
            };

            console.log('✅ Sesión verificada:', sesionData);
            setSesion(sesionData);
        } catch (e) {
            console.error('Error al verificar sesión:', e);
            cerrarSesion();
        } finally {
            setCargando(false);
        }
    };

    const login = async (usuarioInput, passwordInput, recordar = false) => {
        // Este método no se usa en el nuevo flujo, el login se maneja en Login.jsx
        // Pero lo mantenemos por compatibilidad
        console.warn('AuthContext.login() está deprecado, usar Login.jsx');
        return { success: false, error: "Usar el componente Login.jsx para autenticación" };
    };

    const cerrarSesion = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error al cerrar sesión en Supabase:', error);
        }
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setSesion(null);
        navigate('/login');
    };

    const tienePermiso = (recurso) => {
        if (!sesion) {
            console.warn('⚠️ No hay sesión activa');
            return false;
        }
        
        // Mapear permisos por rol (ya normalizado en minúsculas)
        const permisosRol = PERMISOS[sesion.rol];
        
        if (!permisosRol) {
            console.warn(`⚠️ No se encontraron permisos para el rol: ${sesion.rol}`);
            return false;
        }
        
        const tieneAcceso = permisosRol.includes(recurso);
        console.log(`🔐 Verificando permiso "${recurso}" para rol "${sesion.rol}":`, tieneAcceso);
        
        return tieneAcceso;
    };

    const tieneRol = (rolesRequeridos) => {
        if (!sesion?.rol) {
            return false;
        }

        const roles = Array.isArray(rolesRequeridos) ? rolesRequeridos : [rolesRequeridos];
        return roles.map((rol) => rol.toLowerCase()).includes(sesion.rol);
    };

    const esAdministrador = tieneRol(ADMIN_ROLES);

    const value = {
        sesion,
        user: sesion?.userData || null, // Exponer userData como 'user' para compatibilidad
        cargando,
        login,
        cerrarSesion,
        tienePermiso,
        tieneRol,
        esAdministrador,
        verificarSesion
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
