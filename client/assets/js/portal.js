/* ==========================================================================
   PORTAL.JS - Lógica del portal público (index)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    inicializarHeader();
});

/* ==========================================================================
   HEADER DINÁMICO
   ========================================================================== */

function inicializarHeader() {
    const headerActions = document.getElementById("headerActions");
    if (!headerActions) return;

    const sesion = obtenerSesion();

    if (sesion) {
        renderizarHeaderLogueado(headerActions, sesion);
    } else {
        renderizarHeaderPublico(headerActions);
    }
}

function renderizarHeaderLogueado(contenedor, sesion) {
    contenedor.innerHTML = `
        <span class="user-display">${sesion.nombre}</span>
        <button class="btn btn-sm btn-outline" id="btnLogout" title="Cerrar sesión">
            <i class="ph ph-sign-out"></i> Salir
        </button>
    `;

    document.getElementById("btnLogout").addEventListener("click", cerrarSesion);
}

function renderizarHeaderPublico(contenedor) {
    contenedor.innerHTML = `
        <button class="btn-icon" aria-label="Buscar"><i class="ph ph-magnifying-glass"></i></button>
        <a href="pages/login.html" class="btn btn-primary btn-sm">Acceso</a>
    `;
}