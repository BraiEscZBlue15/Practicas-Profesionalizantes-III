/* ==========================================================================
   ESCUELAS_SEGURAS_BASE.JS - Página base definitiva (v2)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const sesion = obtenerSesion();

    if (!sesion) {
        window.location.href = "login.html";
        return;
    }

    if (!tienePermiso(sesion.rol, "escuelas_seguras")) {
        mostrarAccesoDenegado();
        return;
    }

    inicializarPaginaBase(sesion);
});

/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */

function inicializarPaginaBase(sesion) {
    mostrarNombreUsuario(sesion);
    configurarLogout();
    renderizarContactos();
    renderizarProtocolos();
    configurarPrevisualizarProtocolos();
    renderizarRecursos();
    renderizarProtocolosCards();
    renderizarAccionesPorRol(sesion);
}

function mostrarNombreUsuario(sesion) {
    const nombreEl = document.getElementById("nombreUsuario");
    if (nombreEl && sesion.nombre) {
        nombreEl.textContent = sesion.nombre;
    }
}

function configurarLogout() {
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", cerrarSesion);
    }
}

/* ==========================================================================
   RENDERIZADO DE CONTACTOS
   ========================================================================== */

function renderizarContactos() {
    const contenedor = document.getElementById("lista-contactos");
    if (!contenedor) return;

    const contactos = obtenerDeStorage("contactos_emergencia") || [];
    const iconos = {
        "Bomberos": "ph-fire-extinguisher",
        "Emergencias Médicas": "ph-first-aid",
        "Policía": "ph-shield",
        "Defensa Civil": "ph-building",
        "Dirección del Establecimiento": "ph-user-circle"
    };

    contenedor.innerHTML = contactos.map(c => `
        <li>
            <span class="contacto-icon">
                <i class="ph ${iconos[c.nombre] || 'ph-phone'}"></i>
            </span>
            <div>
                <strong>${c.nombre}</strong>
                <span class="contacto-numero">${c.numero}</span>
            </div>
        </li>
    `).join("");
}

/* ==========================================================================
   RENDERIZADO DE PROTOCOLOS (LISTA)
   ========================================================================== */

function renderizarProtocolos() {
    const contenedor = document.getElementById("lista-protocolos");
    if (!contenedor) return;

    const protocolos = obtenerDeStorage("protocolos") || [];
    const iconos = [
        "ph-fire-extinguisher",
        "ph-first-aid",
        "ph-warning",
        "ph-gas-cylinder",
        "ph-lightning"
    ];

    contenedor.innerHTML = protocolos.map((p, i) => `
        <div class="protocolo-item">
            <div class="protocolo-icono">
                <i class="ph ${iconos[i] || 'ph-file-text'}"></i>
            </div>
            <div class="protocolo-info">
                <h4>${p.titulo}</h4>
                <p>${p.descripcion}</p>
            </div>
            ${p.archivo_url ? `
            <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                <button class="btn btn-outline btn-sm btn-previsualizar" data-url="${p.archivo_url}" data-titulo="${p.titulo}">
                    <i class="ph ph-eye"></i> Previsualizar
                </button>
                <a href="${p.archivo_url}" class="btn btn-primary btn-sm" download>
                    <i class="ph ph-download"></i> Descargar
                </a>
            </div>
        ` : `
            <span style="color: var(--text-light); font-size: 0.85rem;">Sin archivo</span>
        `}
        </div>
    `).join("");
}

/* ==========================================================================
   RENDERIZADO DE PROTOCOLOS (TARJETAS)
   ========================================================================== */

function renderizarProtocolosCards() {
    const contenedor = document.getElementById("grid-protocolos");
    if (!contenedor) return;

    const protocolos = obtenerDeStorage("protocolos") || [];
    const iconos = [
        "ph-fire-extinguisher",
        "ph-first-aid",
        "ph-warning",
        "ph-gas-cylinder",
        "ph-lightning"
    ];

    contenedor.innerHTML = protocolos.map((p, i) => `
        <div class="protocolo-card">
            <div class="protocolo-card-icono">
                <i class="ph ${iconos[i] || 'ph-file-text'}"></i>
            </div>
            <h4>${p.titulo}</h4>
            <p>${p.descripcion.substring(0, 120)}${p.descripcion.length > 120 ? '...' : ''}</p>
            ${p.archivo_url ? `
                <a href="${p.archivo_url}" class="btn btn-primary btn-sm btn-full" download>
                    <i class="ph ph-download"></i> Descargar PDF
                </a>
            ` : `
                <span style="color: var(--text-light); font-size: 0.85rem; text-align: center;">Sin archivo</span>
            `}
        </div>
    `).join("");
}

/* ==========================================================================
   RENDERIZADO DE RECURSOS
   ========================================================================== */

function renderizarRecursos() {
    const contenedor = document.getElementById("lista-recursos");
    if (!contenedor) return;

    const recursos = obtenerDeStorage("recursos") || [];
    const iconos = {
        "PDF": "ph-file-pdf",
        "Video": "ph-video",
        "Archivo": "ph-file-text"
    };

    contenedor.innerHTML = recursos.map((r) => {
        const esVideo = r.tipo === "Video" && r.archivo_url;
        
        return `
            <div class="protocolo-item">
                <div class="protocolo-icono">
                    <i class="ph ${iconos[r.tipo] || 'ph-file-text'}"></i>
                </div>
                <div class="protocolo-info">
                    <h4>${r.titulo}</h4>
                    <p>${r.descripcion}</p>
                    ${esVideo ? `
                        <div class="video-wrapper" style="margin-top: 0.75rem;">
                            <iframe src="${obtenerUrlEmbebida(r.archivo_url)}" 
                                style="width: 100%; height: 400px; border: none; border-radius: var(--radius-sm);" 
                                allowfullscreen>
                            </iframe>
                        </div>
                    ` : ''}
                </div>
                ${r.archivo_url ? `
                    <a href="${r.archivo_url}" class="btn btn-primary btn-sm btn-descarga" ${esVideo ? 'target="_blank"' : 'download'}>
                        <i class="ph ${esVideo ? 'ph-play' : 'ph-download'}"></i> ${esVideo ? 'Ver video' : 'Descargar'}
                    </a>
                ` : `
                    <span style="color: var(--text-light); font-size: 0.85rem;">Sin archivo</span>
                `}
            </div>
        `;
    }).join("");
}

function obtenerUrlEmbebida(url) {
    if (url.includes("youtube.com/watch?v=")) {
        const videoId = url.split("v=")[1]?.split("&")[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com/")) {
        const videoId = url.split("vimeo.com/")[1];
        return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
}
/* ==========================================================================
   ACCIONES POR ROL
   ========================================================================== */

function renderizarAccionesPorRol(sesion) {
    const contenedor = document.getElementById("accionesRol");
    if (!contenedor) return;

    let html = "";

    switch (sesion.rol) {
        case "profesor":
            html = renderizarAccionesProfesor();
            break;
        case "estudiante":
            html = renderizarAccionesEstudiante();
            break;
        case "personal":
            html = renderizarAccionesPersonal();
            break;
        case "admin":
            html = renderizarAccionesAdmin();
            break;
    }

    contenedor.innerHTML = html;
    configurarEventosRol(sesion.rol);
}

function renderizarAccionesProfesor() {
    return `
        <div class="base-card">
            <div class="base-card-header">
                <i class="ph ph-upload"></i>
                <h3>Subir Material Educativo</h3>
            </div>
            <div class="base-card-body">
                <p>Compartí guías, presentaciones y recursos para la comunidad educativa.</p>
                <div class="upload-area" id="uploadMaterialProfesor">
                    <i class="ph ph-cloud-arrow-up"></i>
                    <p>Arrastrá archivos o hacé clic para cargar</p>
                    <p class="upload-hint">PDF, DOCX, PPTX. Máximo 10 MB.</p>
                    <input type="file" id="inputMaterialProfesor" accept=".pdf,.docx,.pptx" multiple>
                </div>
            </div>
        </div>
    `;
}

function renderizarAccionesEstudiante() {
    return `
        <div class="base-card">
            <div class="base-card-header">
                <i class="ph ph-download"></i>
                <h3>Material de Descarga</h3>
            </div>
            <div class="base-card-body">
                <ul class="base-lista">
                    <li>
                        <i class="ph ph-file-pdf"></i>
                        <div>
                            <strong>Manual de Convivencia</strong>
                            <p>Normas y pautas de comportamiento institucional.</p>
                        </div>
                        <a href="#" class="btn btn-sm btn-outline" title="Descargar">
                            <i class="ph ph-download"></i>
                        </a>
                    </li>
                    <li>
                        <i class="ph ph-file-pdf"></i>
                        <div>
                            <strong>Calendario Escolar 2024</strong>
                            <p>Fechas importantes y cronograma académico.</p>
                        </div>
                        <a href="#" class="btn btn-sm btn-outline" title="Descargar">
                            <i class="ph ph-download"></i>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    `;
}

function renderizarAccionesPersonal() {
    return `
        <div class="base-card">
            <div class="base-card-header">
                <i class="ph ph-warning-circle"></i>
                <h3>Registro de Incidentes</h3>
            </div>
            <div class="base-card-body">
                <p>Reportá cualquier incidente relacionado con seguridad o infraestructura.</p>
                <button class="btn btn-primary" id="btnNuevoIncidenteBase">
                    <i class="ph ph-plus"></i> Registrar incidente
                </button>
                <div id="formIncidenteBase" class="form-interno hidden" style="margin-top: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Tipo de incidente</label>
                        <input type="text" id="tipoIncidenteBase" class="form-input" placeholder="Ej: Caída, rotura, etc.">
                    </div>
                    <div class="form-fila" style="margin-top: 1rem;">
                        <div class="form-group">
                            <label class="form-label">Gravedad</label>
                            <select id="gravedadIncidenteBase" class="form-input" style="padding-left: 0.75rem;">
                                <option value="Leve">Leve</option>
                                <option value="Moderada">Moderada</option>
                                <option value="Alta">Alta</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Fecha</label>
                            <input type="date" id="fechaIncidenteBase" class="form-input" style="padding-left: 0.75rem;">
                        </div>
                    </div>
                    <div class="form-acciones">
                        <button class="btn btn-primary btn-sm" id="btnGuardarIncidenteBase">Guardar</button>
                        <button class="btn btn-outline btn-sm" id="btnCancelarIncidenteBase">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderizarAccionesAdmin() {
    return `
        <div class="base-card" style="text-align: center;">
            <div class="base-card-header" style="justify-content: center;">
                <i class="ph ph-gear"></i>
                <h3>Panel de Administración</h3>
            </div>
            <div class="base-card-body">
                <p>Estás viendo la página base. Para gestionar contenido, accedé al panel de administración.</p>
                <a href="escuelas_seguras.html" class="btn btn-primary">
                    <i class="ph ph-sliders"></i> Ir al Dashboard Admin
                </a>
            </div>
        </div>
    `;
}

/* ==========================================================================
   EVENTOS POR ROL
   ========================================================================== */

function configurarEventosRol(rol) {
    switch (rol) {
        case "profesor":
            configurarUploadProfesor();
            break;
        case "personal":
            configurarFormularioIncidenteBase();
            configurarBotonFlotante();
            break;
    }
}

function configurarUploadProfesor() {
    const uploadArea = document.getElementById("uploadMaterialProfesor");
    const inputFile = document.getElementById("inputMaterialProfesor");

    if (!uploadArea || !inputFile) return;

    uploadArea.addEventListener("click", () => {
        inputFile.click();
    });

    inputFile.addEventListener("change", (event) => {
        const archivos = event.target.files;
        if (archivos.length > 0) {
            alert(`${archivos.length} archivo(s) cargado(s) correctamente.`);
        }
    });
}

function configurarFormularioIncidenteBase() {
    const btnNuevo = document.getElementById("btnNuevoIncidenteBase");
    const btnGuardar = document.getElementById("btnGuardarIncidenteBase");
    const btnCancelar = document.getElementById("btnCancelarIncidenteBase");
    const formulario = document.getElementById("formIncidenteBase");

    if (!btnNuevo || !formulario) return;

    btnNuevo.addEventListener("click", () => {
        formulario.classList.remove("hidden");
        btnNuevo.classList.add("hidden");
    });

    if (btnCancelar) {
        btnCancelar.addEventListener("click", () => {
            formulario.classList.add("hidden");
            btnNuevo.classList.remove("hidden");
        });
    }

    if (btnGuardar) {
        btnGuardar.addEventListener("click", () => {
            const tipo = document.getElementById("tipoIncidenteBase").value.trim();
            const gravedad = document.getElementById("gravedadIncidenteBase").value;
            const fecha = document.getElementById("fechaIncidenteBase").value;

            if (!tipo || !fecha) {
                alert("Completá tipo y fecha del incidente.");
                return;
            }

            alert("Incidente registrado correctamente.");
            formulario.classList.add("hidden");
            btnNuevo.classList.remove("hidden");

            document.getElementById("tipoIncidenteBase").value = "";
            document.getElementById("fechaIncidenteBase").value = "";
        });
    }
}

/* ==========================================================================
   BOTÓN FLOTANTE Y MODAL DE NOVEDADES (PERSONAL)
   ========================================================================== */

function configurarBotonFlotante() {
    const btnFlotante = document.getElementById("btnReportarNovedad");
    const modal = document.getElementById("modalNovedad");
    const btnCerrar = document.getElementById("btnCerrarModal");
    const btnGuardar = document.getElementById("btnGuardarNovedad");

    if (!btnFlotante || !modal) return;

    btnFlotante.classList.remove("hidden");

    btnFlotante.addEventListener("click", () => {
        modal.classList.remove("hidden");
    });

    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
            modal.classList.add("hidden");
        });
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });

    if (btnGuardar) {
        btnGuardar.addEventListener("click", guardarNovedad);
    }
}

function guardarNovedad() {
    const sector = document.getElementById("novedadSector").value;
    const tipo = document.getElementById("novedadTipo").value;
    const prioridad = document.getElementById("novedadPrioridad").value;
    const descripcion = document.getElementById("novedadDescripcion").value.trim();

    if (!sector || !tipo || !prioridad || !descripcion) {
        alert("Completá todos los campos.");
        return;
    }

    const novedades = obtenerDeStorage("novedades") || [];

    novedades.push({
        id: generarId(),
        fecha: new Date().toISOString().split("T")[0],
        sector,
        tipo,
        prioridad,
        descripcion,
        estado: "Pendiente",
        reportadoPor: obtenerSesion()?.nombre || "Personal"
    });

    guardarEnStorage("novedades", novedades);

    document.getElementById("novedadSector").value = "";
    document.getElementById("novedadTipo").value = "";
    document.getElementById("novedadPrioridad").value = "";
    document.getElementById("novedadDescripcion").value = "";

    document.getElementById("modalNovedad").classList.add("hidden");

    alert("Novedad reportada correctamente.");
}

/* ==========================================================================
   PREVISUALIZAR PDF DE PROTOCOLOS
   ========================================================================== */

function configurarPrevisualizarProtocolos() {
    document.querySelectorAll(".btn-previsualizar").forEach(btn => {
        btn.addEventListener("click", () => {
            const url = btn.dataset.url;
            const titulo = btn.dataset.titulo;
            abrirPrevisualizar(url, titulo);
        });
    });

    document.getElementById("btnCerrarPrevisualizar").addEventListener("click", () => {
        document.getElementById("modalPrevisualizar").classList.add("hidden");
    });

    document.getElementById("modalPrevisualizar").addEventListener("click", (e) => {
        if (e.target === document.getElementById("modalPrevisualizar")) {
            document.getElementById("modalPrevisualizar").classList.add("hidden");
        }
    });
}

function abrirPrevisualizar(url, titulo) {
    document.getElementById("modalPrevisualizarTitulo").innerHTML = `<i class="ph ph-file-pdf"></i> ${titulo}`;
    document.getElementById("btnDescargarPrevisualizar").href = url;
    document.getElementById("modalPrevisualizar").classList.remove("hidden");

    const visor = document.getElementById("visor-previsualizar");
    
    if (window.AdobeDC) {
        const adobeDCView = new AdobeDC.View({
            clientId: "572d1f01286b4e2fa9aa2091885d5a58",
            divId: "visor-previsualizar"
        });
        adobeDCView.previewFile({
            content: { location: { url: url } },
            metaData: { fileName: titulo, hasDownload: false }
        }, {
            embedMode: "SIZED_CONTAINER",
            defaultViewMode: "FIT_WIDTH",
            showAnnotationTools: false,
            showPrintPDF: false,
            showDownloadPDF: false,
            showZoomControl: true
        });
    } else {
        visor.innerHTML = `<iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>`;
    }
}