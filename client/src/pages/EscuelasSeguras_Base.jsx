import { useEffect, useState } from 'react';
import { obtenerDeStorage } from '../utils/helpers';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const EscuelasSeguras_Base = () => {
    const [planoUrl, setPlanoUrl] = useState(null);
    const [protocolos, setProtocolos] = useState([]);
    const [recursos, setRecursos] = useState([]);
    const [contactos, setContactos] = useState([]);
    const { sesion } = useAuth();

    useEffect(() => {
        const plano = obtenerDeStorage("plano_evacuacion_url");
        const prots = obtenerDeStorage("protocolos") || [];
        const recs = obtenerDeStorage("recursos") || [];
        const conts = obtenerDeStorage("contactos_emergencia") || [];

        setPlanoUrl(plano);
        setProtocolos(prots);
        setRecursos(recs);
        setContactos(conts);
    }, []);

    return (
        <div className="dashboard-page">
            <Header />

            <main className="dashboard-main container">
                <section className="base-view">
                    {/* Información crucial */}
                    <div className="base-hero">
                        <div className="base-hero-icon">
                            <i className="ph ph-shield-check"></i>
                        </div>
                        <h1 className="base-hero-title">Escuelas Seguras</h1>
                        <p className="base-hero-text">
                            Información esencial sobre protocolos de seguridad, evacuación y prevención de riesgos
                            para toda la comunidad educativa.
                        </p>
                    </div>

                    {/* Grid de información */}
                    <div className="base-grid">
                        
                        {/* Planos de evacuación */}
                        <div className="base-card">
                            <div className="base-card-header">
                                <i className="ph ph-map-pin"></i>
                                <h3>Planos de Evacuación</h3>
                            </div>
                            <div className="base-card-body">
                                <p>Consultá los planos actualizados con rutas de evacuación y puntos de encuentro.</p>
                                <div className="visor-container" style={{ height: '350px' }}>
                                    {planoUrl ? (
                                        <iframe src={planoUrl} title="Plano de evacuación"></iframe>
                                    ) : (
                                        <div className="visor-placeholder">
                                            <i className="ph ph-map-pin"></i>
                                            <p>Plano no disponible momentáneamente.</p>
                                        </div>
                                    )}
                                </div>
                                {planoUrl && (
                                    <button className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
                                        <i className="ph ph-download"></i> Descargar plano (PDF)
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Protocolos de emergencia */}
                        <div className="base-card">
                            <div className="base-card-header">
                                <i className="ph ph-file-text"></i>
                                <h3>Protocolos de Emergencia</h3>
                            </div>
                            <div className="base-card-body">
                                <ul className="base-lista">
                                    {protocolos.slice(0, 5).map((protocolo, index) => (
                                        <li key={index}>
                                            <i className="ph ph-fire-extinguisher"></i>
                                            <div>
                                                <strong>{protocolo.titulo}</strong>
                                                <p>{protocolo.descripcion.substring(0, 60)}...</p>
                                            </div>
                                            {protocolo.archivo_url && (
                                                <a href={protocolo.archivo_url} className="btn btn-sm btn-outline" title="Descargar">
                                                    <i className="ph ph-download"></i>
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                    {protocolos.length === 0 && (
                                        <li style={{ justifyContent: 'center' }}>
                                            <p>No hay protocolos disponibles.</p>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Contactos de emergencia */}
                        <div className="base-card">
                            <div className="base-card-header">
                                <i className="ph ph-phone-call"></i>
                                <h3>Contactos de Emergencia</h3>
                            </div>
                            <div className="base-card-body">
                                <ul className="base-lista contactos-lista">
                                    {contactos.map((contacto, index) => (
                                        <li key={index}>
                                            <i className="ph ph-phone"></i>
                                            <div>
                                                <strong>{contacto.nombre}</strong>
                                                <p>{contacto.numero}</p>
                                            </div>
                                        </li>
                                    ))}
                                    {contactos.length === 0 && (
                                        <li style={{ justifyContent: 'center' }}>
                                            <p>No hay contactos disponibles.</p>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Recursos complementarios */}
                        <div className="base-card">
                            <div className="base-card-header">
                                <i className="ph ph-book-open"></i>
                                <h3>Recursos Complementarios</h3>
                            </div>
                            <div className="base-card-body">
                                <ul className="base-lista">
                                    {recursos.map((recurso, index) => (
                                        <li key={index}>
                                            <i className="ph ph-file-pdf"></i>
                                            <div>
                                                <strong>{recurso.titulo}</strong>
                                                <p>{recurso.descripcion.substring(0, 60)}...</p>
                                            </div>
                                            {recurso.archivo_url && (
                                                <a href={recurso.archivo_url} className="btn btn-sm btn-outline" title="Descargar">
                                                    <i className="ph ph-download"></i>
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                    {recursos.length === 0 && (
                                        <li style={{ justifyContent: 'center' }}>
                                            <p>No hay recursos disponibles.</p>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                    </div>
                </section>
            </main>
        </div>
    );
};

export default EscuelasSeguras_Base;
