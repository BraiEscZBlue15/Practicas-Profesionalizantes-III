/* ==========================================================================
   SECCION_NOVEDADES.JS - Reportes del personal
   ========================================================================== */

function renderizarNovedades() {
    const novedades = obtenerDeStorage("novedades") || [];

    let filas = novedades.map((n, index) => {
        const clasePrioridad = n.prioridad === "Alta" ? "estado.alerta" : 
                               n.prioridad === "Media" ? "estado.pendiente" : "estado.completo";
        const claseEstado = n.estado === "Resuelto" ? "completo" : 
                           n.estado === "En revisión" ? "pendiente" : "alerta";

        return `
            <tr>
                <td>${formatearFecha(n.fecha)}</td>
                <td>${n.sector}</td>
                <td>${n.tipo}</td>
                <td><span class="estado ${clasePrioridad.replace('estado.', '')}">${n.prioridad}</span></td>
                <td>${n.descripcion}</td>
                <td><span class="estado ${claseEstado}">${n.estado}</span></td>
                <td>
                    <select class="form-input form-select-sm" id="estado_${index}" onchange="cambiarEstadoNovedad(${index}, this.value)">
                        <option value="Pendiente" ${n.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="En revisión" ${n.estado === 'En revisión' ? 'selected' : ''}>En revisión</option>
                        <option value="Resuelto" ${n.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline btn-eliminar-novedad" data-index="${index}" title="Eliminar" style="color: #DC2626;">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    return `
        <div class="seccion-header">
            <h2>Novedades del Personal</h2>
            <p>Reportes del personal de servicio sobre el estado del establecimiento</p>
        </div>
        <div class="tabla-contenedor">
            <table class="tabla tabla-novedades">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Sector</th>
                        <th>Tipo</th>
                        <th>Prioridad</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Cambiar estado</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${filas || '<tr><td colspan="8">No hay novedades reportadas.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function cambiarEstadoNovedad(index, nuevoEstado) {
    const novedades = obtenerDeStorage("novedades") || [];
    novedades[index].estado = nuevoEstado;
    guardarEnStorage("novedades", novedades);
}

function configurarEventosNovedades() {
    document.querySelectorAll(".btn-eliminar-novedad").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            const novedades = obtenerDeStorage("novedades") || [];
            if (confirm("¿Eliminar esta novedad?")) {
                novedades.splice(parseInt(index), 1);
                guardarEnStorage("novedades", novedades);
                cargarSeccion("novedades");
            }
        });
    });
}