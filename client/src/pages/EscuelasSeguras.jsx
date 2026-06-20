import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import SeccionInicio from '../components/admin/SeccionInicio';
import SeccionPlanos from '../components/admin/SeccionPlanos';
import SeccionContactos from '../components/admin/SeccionContactos';
import SeccionProtocolos from '../components/admin/SeccionProtocolos';
import SeccionRecursos from '../components/admin/SeccionRecursos';
import { inicializarDatosDefault } from '../data/defaultData';

const EscuelasSeguras = () => {
    const [seccionActiva, setSeccionActiva] = useState('inicio');
    const { sesion } = useAuth();

    useEffect(() => {
        inicializarDatosDefault();
    }, []);

    const renderizarSeccion = () => {
        switch (seccionActiva) {
            case 'inicio':
                return <SeccionInicio />;
            case 'planos':
                return <SeccionPlanos />;
            case 'contactos':
                return <SeccionContactos />;
            case 'protocolos':
                return <SeccionProtocolos />;
            case 'recursos':
                return <SeccionRecursos />;
            default:
                return <SeccionInicio />;
        }
    };

    const abrirVistaPrevia = () => {
        window.open('/escuelas-seguras-base', '_blank');
    };

    return (
        <div className="dashboard-page">
            <Header />

            <main className="dashboard-main container">
                <section className="dashboard-view">
                    <aside className="sidebar">
                        <nav className="sidebar-nav">
                            <span className="sidebar-label">Contenido Público</span>
                            <button 
                                className={`sidebar-btn ${seccionActiva === 'inicio' ? 'active' : ''}`}
                                onClick={() => setSeccionActiva('inicio')}
                            >
                                <i className="ph ph-house"></i> Inicio
                            </button>
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
                            <span className="sidebar-label" style={{ marginTop: '1rem' }}>Acciones</span>
                            <button className="sidebar-btn" onClick={abrirVistaPrevia}>
                                <i className="ph ph-eye"></i> Vista previa
                            </button>
                        </nav>
                    </aside>

                    <div className="dashboard-content">
                        {renderizarSeccion()}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EscuelasSeguras;
