/* ==========================================================================
   SECCION_INICIO.JS - Panel de control del dashboard admin
   ========================================================================== */

function renderizarInicio() {
    const protocolos = obtenerDeStorage("protocolos") || [];
    const recursos = obtenerDeStorage("recursos") || [];
    const contactos = obtenerDeStorage("contactos_emergencia") || [];
    const planoUrl = obtenerDeStorage("plano_evacuacion_url");

    return `
        <div class="seccion-header">
            <h2>Panel de Control</h2>
            <p>Resumen del contenido publicado en la página base</p>
        </div>
        <div class="resumen-grid">
            <div class="resumen-card">
                <i class="ph ph-map-pin"></i>
                <div class="resumen-valor">${planoUrl ? "Cargado" : "No cargado"}</div>
                <div class="resumen-label">Plano de evacuación</div>
            </div>
            <div class="resumen-card">
                <i class="ph ph-clipboard-text"></i>
                <div class="resumen-valor">${protocolos.length}</div>
                <div class="resumen-label">Protocolos publicados</div>
            </div>
            <div class="resumen-card">
                <i class="ph ph-book-open"></i>
                <div class="resumen-valor">${recursos.length}</div>
                <div class="resumen-label">Recursos publicados</div>
            </div>
            <div class="resumen-card">
                <i class="ph ph-phone-call"></i>
                <div class="resumen-valor">${contactos.length}</div>
                <div class="resumen-label">Contactos de emergencia</div>
            </div>
        </div>
    `;
}