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