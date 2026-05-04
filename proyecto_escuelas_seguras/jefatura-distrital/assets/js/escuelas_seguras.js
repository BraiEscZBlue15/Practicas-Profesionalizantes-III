/* ==========================================================================
   ESCUELAS_SEGURAS.JS - Dashboard administrador
   ========================================================================== */

/* ==========================================================================
   DATOS DE PRUEBA
   ========================================================================== */

const documentosMock = [
    { id: 1, nombre: "Protocolo_Emergencia_2024.pdf", fecha: "2024-03-15", tipo: "PDF", tamanio: "2.4 MB" },
    { id: 2, nombre: "Plan_Evacuacion_Anexo.pdf", fecha: "2024-02-28", tipo: "PDF", tamanio: "1.8 MB" },
    { id: 3, nombre: "Normativa_Incendios.pdf", fecha: "2024-01-10", tipo: "PDF", tamanio: "3.1 MB" }
];

const checklistMock = [
    { id: 1, item: "Matafuegos en planta baja", estado: "completo", fecha: "2024-03-20" },
    { id: 2, item: "Salidas de emergencia señalizadas", estado: "completo", fecha: "2024-03-18" },
    { id: 3, item: "Botiquín primeros auxilios", estado: "pendiente", fecha: "2024-03-22" },
    { id: 4, item: "Luces de emergencia operativas", estado: "completo", fecha: "2024-03-15" },
    { id: 5, item: "Plan de evacuación actualizado", estado: "alerta", fecha: "2024-01-05" }
];

const incidentesMock = [
    { id: 1, tipo: "Caída", gravedad: "Leve", fecha: "2024-03-10", estado: "Resuelto" },
    { id: 2, tipo: "Corte de luz", gravedad: "Moderada", fecha: "2024-03-08", estado: "Resuelto" },
    { id: 3, tipo: "Fuga de gas", gravedad: "Alta", fecha: "2024-02-25", estado: "En revisión" }
];

/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const sesion = obtenerSesion();

    if (!sesion) {
        window.location.href = "login.html";
        return;
    }

    if (!tienePermiso(sesion.rol, "escuelas_seguras_admin") || sesion.rol !== "admin") {
        document.getElementById("vistaDashboard").classList.add("hidden");
        document.getElementById("vistaDenegada").classList.remove("hidden");
        return;
    }

    inicializarDashboard(sesion);
});

/* ==========================================================================
   INICIALIZACIÓN DEL DASHBOARD
   ========================================================================== */

function inicializarDashboard(sesion) {
    mostrarNombreUsuario(sesion);
    configurarSidebar();
    configurarVistaPrevia();
    configurarLogout();
    cargarSeccion("inicio");
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
   NAVEGACIÓN DEL SIDEBAR
   ========================================================================== */

function configurarSidebar() {
    const botones = document.querySelectorAll(".sidebar-btn[data-seccion]");

    botones.forEach(btn => {
        btn.addEventListener("click", () => {
            const seccion = btn.dataset.seccion;

            botones.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            cargarSeccion(seccion);
        });
    });
}

function configurarVistaPrevia() {
    const btnVistaPrevia = document.getElementById("btnVistaPrevia");

    if (btnVistaPrevia) {
        btnVistaPrevia.addEventListener("click", () => {
            window.open("escuelas_seguras_base_2.html", "_blank");
        });
    }
}

function cargarSeccion(seccion) {
    const contenedor = document.getElementById("contenidoSeccion");
    if (!contenedor) return;

    switch (seccion) {
        case "inicio":
            contenedor.innerHTML = renderizarInicio();
            break;
        case "documentos":
            contenedor.innerHTML = renderizarDocumentos();
            configurarUploadDocumentos();
            break;
        case "checklist":
            contenedor.innerHTML = renderizarChecklist();
            break;
        case "incidentes":
            contenedor.innerHTML = renderizarIncidentes();
            configurarFormularioIncidente();
            break;
        case "indicadores":
            contenedor.innerHTML = renderizarIndicadores();
            break;
        case "planos":
            contenedor.innerHTML = renderizarPlanos();
            configurarVisorPlanos();
            break;
        default:
            contenedor.innerHTML = renderizarInicio();
    }
}

/* ==========================================================================
   RENDERIZADO DE SECCIONES
   ========================================================================== */

function renderizarInicio() {
    const totalDocs = documentosMock.length;
    const checklistCompleto = checklistMock.filter(c => c.estado === "completo").length;
    const incidentesActivos = incidentesMock.filter(i => i.estado !== "Resuelto").length;
    const cumplimiento = Math.round((checklistCompleto / checklistMock.length) * 100);

    return `
        <div class="seccion-header">
            <h2>Panel de Control - Admin</h2>
            <p>Resumen general de Escuelas Seguras</p>
        </div>
        <div class="resumen-grid">
            <div class="resumen-card">
                <i class="ph ph-file-text"></i>
                <div class="resumen-valor">${totalDocs}</div>
                <div class="resumen-label">Documentos cargados</div>
            </div>
            <div class="resumen-card">
                <i class="ph ph-check-square"></i>
                <div class="resumen-valor">${checklistCompleto}/${checklistMock.length}</div>
                <div class="resumen-label">Checklist completado</div>
            </div>
            <div class="resumen-card">
                <i class="ph ph-warning-circle"></i>
                <div class="resumen-valor">${incidentesActivos}</div>
                <div class="resumen-label">Incidentes activos</div>
            </div>
            <div class="resumen-card">
                <i class="ph ph-trend-up"></i>
                <div class="resumen-valor">${cumplimiento}%</div>
                <div class="resumen-label">Cumplimiento general</div>
            </div>
        </div>
    `;
}

function renderizarDocumentos() {
    let filas = documentosMock.map(doc => `
        <tr>
            <td><i class="ph ph-file-pdf" style="color: #DC2626;"></i> ${doc.nombre}</td>
            <td>${doc.fecha}</td>
            <td>${doc.tamanio}</td>
            <td>
                <button class="btn btn-sm btn-outline" title="Descargar">
                    <i class="ph ph-download"></i>
                </button>
            </td>
        </tr>
    `).join("");

    return `
        <div class="seccion-header">
            <h2>Documentos</h2>
            <p>Gestión de documentación de seguridad e higiene</p>
        </div>
        <div class="upload-area" id="uploadDocumentos">
            <i class="ph ph-cloud-arrow-up"></i>
            <p>Arrastrá archivos PDF o hacé clic para cargar</p>
            <p class="upload-hint">Solo archivos PDF. Máximo 10 MB por archivo.</p>
            <input type="file" id="inputDocumentos" accept=".pdf" multiple>
        </div>
        <div class="tabla-contenedor" style="margin-top: 1.5rem;">
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Fecha</th>
                        <th>Tamaño</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas || '<tr><td colspan="4">No hay documentos cargados.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function renderizarChecklist() {
    let filas = checklistMock.map(item => {
        const claseEstado = item.estado === "completo" ? "completo" : 
                           item.estado === "pendiente" ? "pendiente" : "alerta";
        const textoEstado = item.estado.charAt(0).toUpperCase() + item.estado.slice(1);

        return `
            <tr>
                <td>${item.item}</td>
                <td><span class="estado ${claseEstado}">${textoEstado}</span></td>
                <td>${item.fecha}</td>
                <td>
                    <button class="btn btn-sm btn-outline" title="Editar">
                        <i class="ph ph-pencil"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    return `
        <div class="seccion-header">
            <h2>Checklist de Protocolos</h2>
            <p>Verificación periódica de elementos de seguridad</p>
        </div>
        <div class="tabla-contenedor">
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Ítem</th>
                        <th>Estado</th>
                        <th>Última revisión</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas}
                </tbody>
            </table>
        </div>
    `;
}

function renderizarIncidentes() {
    let filas = incidentesMock.map(inc => `
        <tr>
            <td>${inc.tipo}</td>
            <td>${inc.gravedad}</td>
            <td>${inc.fecha}</td>
            <td><span class="estado ${inc.estado === 'Resuelto' ? 'completo' : 'alerta'}">${inc.estado}</span></td>
            <td>
                <button class="btn btn-sm btn-outline" title="Ver detalle">
                    <i class="ph ph-eye"></i>
                </button>
            </td>
        </tr>
    `).join("");

    return `
        <div class="seccion-header">
            <h2>Registro de Incidentes</h2>
            <p>Seguimiento de eventos relacionados con seguridad</p>
        </div>
        <button class="btn btn-primary" id="btnNuevoIncidente" style="margin-bottom: 1.5rem;">
            <i class="ph ph-plus"></i> Registrar incidente
        </button>
        <div id="formIncidente" class="form-interno hidden" style="margin-bottom: 2rem;">
            <div class="form-group">
                <label class="form-label">Tipo de incidente</label>
                <input type="text" id="tipoIncidente" class="form-input" placeholder="Ej: Caída, incendio, etc.">
            </div>
            <div class="form-fila" style="margin-top: 1rem;">
                <div class="form-group">
                    <label class="form-label">Gravedad</label>
                    <select id="gravedadIncidente" class="form-input" style="padding-left: 0.75rem;">
                        <option value="Leve">Leve</option>
                        <option value="Moderada">Moderada</option>
                        <option value="Alta">Alta</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Fecha</label>
                    <input type="date" id="fechaIncidente" class="form-input" style="padding-left: 0.75rem;">
                </div>
            </div>
            <div class="form-acciones">
                <button class="btn btn-primary btn-sm" id="btnGuardarIncidente">Guardar</button>
                <button class="btn btn-outline btn-sm" id="btnCancelarIncidente">Cancelar</button>
            </div>
        </div>
        <div class="tabla-contenedor">
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Gravedad</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas}
                </tbody>
            </table>
        </div>
    `;
}

function renderizarIndicadores() {
    return `
        <div class="seccion-header">
            <h2>Indicadores</h2>
            <p>Métricas y estadísticas de seguridad institucional</p>
        </div>
        <div class="resumen-grid">
            <div class="resumen-card">
                <i class="ph ph-fire-extinguisher"></i>
                <div class="resumen-valor">12</div>
                <div class="resumen-label">Matafuegos en servicio</div>
            </div>
            <div class="resumen-card">
                <i class="ph ph-users"></i>
                <div class="resumen-valor">45</div>
                <div class="resumen-label">Personas capacitadas</div>
            </div>
            <div class="resumen-card">
                <i class="ph ph-clock"></i>
                <div class="resumen-valor">3</div>
                <div class="resumen-label">Simulacros este año</div>
            </div>
            <div class="resumen-card">
                <i class="ph ph-calendar-check"></i>
                <div class="resumen-valor">92%</div>
                <div class="resumen-label">Cumplimiento anual</div>
            </div>
        </div>
    `;
}

function renderizarPlanos() {
    return `
        <div class="seccion-header">
            <h2>Visor de Planos</h2>
            <p>Visualización de planos institucionales en formato PDF</p>
        </div>
        <div class="upload-area" id="uploadPlano" style="margin-bottom: 1.5rem;">
            <i class="ph ph-cloud-arrow-up"></i>
            <p>Cargar plano en formato PDF</p>
            <p class="upload-hint">El archivo se visualizará con Adobe PDF Embed API</p>
            <input type="file" id="inputPlano" accept=".pdf">
        </div>
        <div class="visor-container" id="visorPlanos">
            <div class="visor-placeholder">
                <i class="ph ph-map-pin"></i>
                <p>No hay ningún plano cargado.</p>
                <p style="font-size: 0.85rem;">Subí un archivo PDF para visualizarlo aquí.</p>
            </div>
        </div>
    `;
}

/* ==========================================================================
   CONFIGURACIÓN DE EVENTOS DINÁMICOS
   ========================================================================== */

function configurarUploadDocumentos() {
    const uploadArea = document.getElementById("uploadDocumentos");
    const inputFile = document.getElementById("inputDocumentos");

    if (!uploadArea || !inputFile) return;

    uploadArea.addEventListener("click", () => {
        inputFile.click();
    });

    inputFile.addEventListener("change", (event) => {
        const archivos = event.target.files;
        if (archivos.length > 0) {
            for (const archivo of archivos) {
                if (archivo.type !== "application/pdf") {
                    alert(`El archivo "${archivo.nombre}" no es PDF. Solo se permiten archivos PDF.`);
                    continue;
                }
                documentosMock.push({
                    id: documentosMock.length + 1,
                    nombre: archivo.name,
                    fecha: new Date().toISOString().split("T")[0],
                    tipo: "PDF",
                    tamanio: formatearTamanio(archivo.size)
                });
            }
            cargarSeccion("documentos");
        }
    });
}

function configurarFormularioIncidente() {
    const btnNuevo = document.getElementById("btnNuevoIncidente");
    const btnGuardar = document.getElementById("btnGuardarIncidente");
    const btnCancelar = document.getElementById("btnCancelarIncidente");
    const formulario = document.getElementById("formIncidente");

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
            const tipo = document.getElementById("tipoIncidente").value.trim();
            const gravedad = document.getElementById("gravedadIncidente").value;
            const fecha = document.getElementById("fechaIncidente").value;

            if (!tipo || !fecha) {
                alert("Completá tipo y fecha del incidente.");
                return;
            }

            incidentesMock.push({
                id: incidentesMock.length + 1,
                tipo: tipo,
                gravedad: gravedad,
                fecha: fecha,
                estado: "En revisión"
            });

            formulario.classList.add("hidden");
            btnNuevo.classList.remove("hidden");
            cargarSeccion("incidentes");
        });
    }
}

function configurarVisorPlanos() {
    const uploadArea = document.getElementById("uploadPlano");
    const inputPlano = document.getElementById("inputPlano");
    const visor = document.getElementById("visorPlanos");

    if (!uploadArea || !inputPlano || !visor) return;

    uploadArea.addEventListener("click", () => {
        inputPlano.click();
    });

    inputPlano.addEventListener("change", (event) => {
        const archivo = event.target.files[0];
        if (!archivo) return;

        if (archivo.type !== "application/pdf") {
            alert("Solo se permiten archivos PDF.");
            return;
        }

        const url = URL.createObjectURL(archivo);
        visor.innerHTML = `<iframe src="${url}" title="Visor de plano"></iframe>`;
    });
}

/* ==========================================================================
   UTILIDADES
   ========================================================================== */

function formatearTamanio(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
}