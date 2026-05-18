function renderizarNovedades(filtroEstado = "Todas") {
    let novedades = obtenerDeStorage("novedades") || [];

    if (filtroEstado !== "Todas") {
        novedades = novedades.filter(n => n.estado === filtroEstado);
    }

    let filas = novedades.map((n) => {
        const clasePrioridad = n.prioridad === "Alta" ? "alerta" : 
                               n.prioridad === "Media" ? "pendiente" : "completo";
        const claseEstado = n.estado === "Resuelto" ? "completo" : 
                           n.estado === "En revisión" ? "pendiente" : "alerta";

        return `
            <tr>
                <td>${formatearFecha(n.fecha)}</td>
                <td>${n.reportadoPor || "Personal"}</td>
                <td>${n.sector}</td>
                <td>${n.tipo}</td>
                <td><span class="estado ${clasePrioridad}">${n.prioridad}</span></td>
                <td>${n.descripcion}</td>
                <td><span class="estado ${claseEstado} estado-actual-${n.id}">${n.estado}</span></td>
                <td>
                    <select class="form-input form-select-sm select-estado" data-id="${n.id}">
                        <option value="Pendiente" ${n.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="En revisión" ${n.estado === 'En revisión' ? 'selected' : ''}>En revisión</option>
                        <option value="Resuelto" ${n.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline btn-eliminar-novedad" data-id="${n.id}" title="Eliminar" style="color: #DC2626;">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    const total = obtenerDeStorage("novedades")?.length || 0;
    const pendientes = obtenerDeStorage("novedades")?.filter(n => n.estado === "Pendiente").length || 0;
    const enRevision = obtenerDeStorage("novedades")?.filter(n => n.estado === "En revisión").length || 0;
    const resueltos = obtenerDeStorage("novedades")?.filter(n => n.estado === "Resuelto").length || 0;

        return `
        <div class="seccion-header">
            <h2>Novedades del Personal</h2>
            <p>Reportes del personal de servicio sobre el estado del establecimiento</p>
        </div>
        <div class="filtros-novedades">
            <button class="btn btn-sm ${filtroEstado === 'Todas' ? 'btn-primary' : 'btn-outline'} btn-filtro" data-filtro="Todas">
                Todas (${total})
            </button>
            <button class="btn btn-sm ${filtroEstado === 'Pendiente' ? 'btn-primary' : 'btn-outline'} btn-filtro" data-filtro="Pendiente">
                Pendientes (${pendientes})
            </button>
            <button class="btn btn-sm ${filtroEstado === 'En revisión' ? 'btn-primary' : 'btn-outline'} btn-filtro" data-filtro="En revisión">
                En revisión (${enRevision})
            </button>
            <button class="btn btn-sm ${filtroEstado === 'Resuelto' ? 'btn-primary' : 'btn-outline'} btn-filtro" data-filtro="Resuelto">
                Resueltas (${resueltos})
            </button>
            <button class="btn btn-sm btn-outline" id="btnGuardarCambiosEstados" disabled>
                <i class="ph ph-check"></i> Guardar cambios
            </button>
        </div>
        <div class="tabla-contenedor" style="margin-top: 1rem;">
            <table class="tabla tabla-novedades">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Reportado por</th>
                        <th>Sector</th>
                        <th>Tipo</th>
                        <th>Prioridad</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Cambiar</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${filas || '<tr><td colspan="9">No hay novedades que coincidan con el filtro.</td></tr>'}
                </tbody>
            </table>
        </div>
    
    `;
}

let cambiosPendientes = {};

function cambiarEstadoNovedad(id, nuevoEstado) {
    cambiosPendientes[id] = nuevoEstado;

    // Mostrar badge de estado actualizado temporalmente
    const badge = document.querySelector(`.estado-actual-${id}`);
    if (badge) {
        const clase = nuevoEstado === "Resuelto" ? "completo" : 
                      nuevoEstado === "En revisión" ? "pendiente" : "alerta";
        badge.className = `estado ${clase} estado-actual-${id}`;
        badge.textContent = nuevoEstado;
    }

    // Mostrar botón de guardar
    const btnGuardar = document.getElementById("btnGuardarEstados");
    if (btnGuardar && Object.keys(cambiosPendientes).length > 0) {
        btnGuardar.classList.remove("hidden");
    }
}

function configurarEventosNovedades() {
    // Filtros
    document.querySelectorAll(".btn-filtro").forEach(btn => {
        btn.addEventListener("click", () => {
            const filtro = btn.dataset.filtro;
            const contenedor = document.getElementById("contenidoSeccion");
            contenedor.innerHTML = renderizarNovedades(filtro);
            cambiosPendientes = {};
            configurarEventosNovedades();
        });
    });

    // Selects de estado
    document.querySelectorAll(".select-estado").forEach(select => {
        select.addEventListener("change", () => {
            const id = select.dataset.id;
            const nuevoEstado = select.value;
            
            cambiosPendientes[id] = nuevoEstado;

            const btnGuardar = document.getElementById("btnGuardarCambiosEstados");
            if (btnGuardar) {
                btnGuardar.disabled = false;
                btnGuardar.classList.remove("btn-outline");
                btnGuardar.classList.add("btn-primary");
            }
        });
    });

    // Botón guardar cambios
    const btnGuardar = document.getElementById("btnGuardarCambiosEstados");
    if (btnGuardar) {
        btnGuardar.addEventListener("click", () => {
            const novedades = obtenerDeStorage("novedades") || [];

            Object.entries(cambiosPendientes).forEach(([id, nuevoEstado]) => {
                const index = novedades.findIndex(n => n.id === id);
                if (index !== -1) {
                    novedades[index].estado = nuevoEstado;
                }

                // Actualizar badge visualmente
                const badge = document.querySelector(`.estado-actual-${id}`);
                if (badge) {
                    const clase = nuevoEstado === "Resuelto" ? "completo" : 
                                  nuevoEstado === "En revisión" ? "pendiente" : "alerta";
                    badge.className = `estado ${clase} estado-actual-${id}`;
                    badge.textContent = nuevoEstado;
                }
            });

            guardarEnStorage("novedades", novedades);
            cambiosPendientes = {};

            btnGuardar.disabled = true;
            btnGuardar.classList.remove("btn-primary");
            btnGuardar.classList.add("btn-outline");
            alert("Cambios guardados correctamente.");
        });
    }

    // Eliminar
    document.querySelectorAll(".btn-eliminar-novedad").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const novedades = obtenerDeStorage("novedades") || [];
            if (confirm("¿Eliminar esta novedad?")) {
                const nuevos = novedades.filter(n => n.id !== id);
                guardarEnStorage("novedades", nuevos);
                cargarSeccion("novedades");
            }
        });
    });
}