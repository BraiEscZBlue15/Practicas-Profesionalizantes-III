/* ==========================================================================
   SECCION_SOLICITUDES.JS - Usuarios pendientes de aprobación
   ========================================================================== */

function renderizarSolicitudes() {
    const pendientes = obtenerDeStorage("solicitudes_pendientes") || [];

    let filas = pendientes.map((s, index) => `
        <tr>
            <td>${s.fecha}</td>
            <td>${s.nombre}</td>
            <td>${s.usuario}</td>
            <td>${s.rol}</td>
            <td><span class="estado pendiente">Pendiente</span></td>
            <td>
                <button class="btn btn-sm btn-primary btn-aprobar" data-index="${index}" title="Aprobar">
                    <i class="ph ph-check"></i>
                </button>
                <button class="btn btn-sm btn-outline btn-rechazar" data-index="${index}" title="Rechazar" style="color: #DC2626;">
                    <i class="ph ph-x"></i>
                </button>
            </td>
        </tr>
    `).join("");

    return `
        <div class="seccion-header">
            <h2>Solicitudes de Acceso</h2>
            <p>Usuarios que solicitaron registrarse en la plataforma</p>
        </div>
        <div class="tabla-contenedor">
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas || '<tr><td colspan="6">No hay solicitudes pendientes.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function configurarEventosSolicitudes() {
    document.querySelectorAll(".btn-aprobar").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            const pendientes = obtenerDeStorage("solicitudes_pendientes") || [];
            const aprobados = obtenerDeStorage("usuarios_aprobados") || [];

            if (confirm(`¿Aprobar a ${pendientes[index].nombre} como ${pendientes[index].rol}?`)) {
                aprobados.push(pendientes[index]);
                guardarEnStorage("usuarios_aprobados", aprobados);
                pendientes.splice(parseInt(index), 1);
                guardarEnStorage("solicitudes_pendientes", pendientes);
                cargarSeccion("solicitudes");
            }
        });
    });

    document.querySelectorAll(".btn-rechazar").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            const pendientes = obtenerDeStorage("solicitudes_pendientes") || [];

            if (confirm(`¿Rechazar la solicitud de ${pendientes[index].nombre}?`)) {
                pendientes.splice(parseInt(index), 1);
                guardarEnStorage("solicitudes_pendientes", pendientes);
                cargarSeccion("solicitudes");
            }
        });
    });
}