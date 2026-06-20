import { useState, useEffect } from 'react';
import { obtenerDeStorage } from '../../utils/helpers';

const SeccionInicio = () => {
    const [stats, setStats] = useState({
        plano: false,
        protocolos: 0,
        recursos: 0,
        contactos: 0
    });

    useEffect(() => {
        const protocolos = obtenerDeStorage("protocolos") || [];
        const recursos = obtenerDeStorage("recursos") || [];
        const contactos = obtenerDeStorage("contactos_emergencia") || [];
        const planoUrl = obtenerDeStorage("plano_evacuacion_url");

        setStats({
            plano: !!planoUrl,
            protocolos: protocolos.length,
            recursos: recursos.length,
            contactos: contactos.length
        });
    }, []);

    return (
        <>
            <div className="seccion-header">
                <h2>Panel de Control</h2>
                <p>Resumen del contenido publicado en la página base</p>
            </div>
            <div className="resumen-grid">
                <div className="resumen-card">
                    <i className="ph ph-map-pin"></i>
                    <div className="resumen-valor">{stats.plano ? "Cargado" : "No cargado"}</div>
                    <div className="resumen-label">Plano de evacuación</div>
                </div>
                <div className="resumen-card">
                    <i className="ph ph-clipboard-text"></i>
                    <div className="resumen-valor">{stats.protocolos}</div>
                    <div className="resumen-label">Protocolos publicados</div>
                </div>
                <div className="resumen-card">
                    <i className="ph ph-book-open"></i>
                    <div className="resumen-valor">{stats.recursos}</div>
                    <div className="resumen-label">Recursos publicados</div>
                </div>
                <div className="resumen-card">
                    <i className="ph ph-phone-call"></i>
                    <div className="resumen-valor">{stats.contactos}</div>
                    <div className="resumen-label">Contactos de emergencia</div>
                </div>
            </div>
        </>
    );
};

export default SeccionInicio;
