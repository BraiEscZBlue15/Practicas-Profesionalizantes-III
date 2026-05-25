/* ==========================================================================
   SECCION_PLANOS.JS - CRUD de planos de evacuación
   ========================================================================== */

let planoPendiente = null;
let urlPendiente = null;

function renderizarPlanos() {
    const planoActual = obtenerDeStorage("plano_evacuacion_url");
    const nombreActual = obtenerDeStorage("plano_evacuacion_nombre");

    return `
        <div class="seccion-header">
            <h2>Plano de Evacuación</h2>
            <p>Subí el PDF que se mostrará en la página base</p>
        </div>
        ${!planoActual && !planoPendiente ? `
            <div class="upload-area" id="uploadPlano">
                <i class="ph ph-cloud-arrow-up"></i>
                <p>Arrastrá un archivo PDF o hacé clic para cargar</p>
                <p class="upload-hint">Solo archivos PDF. Máximo 10 MB.</p>
                <input type="file" id="inputPlano" accept=".pdf">
            </div>
            <div class="visor-container visor-plano-vacio" style="margin-top: 1.5rem;">
                <div class="visor-placeholder">
                    <i class="ph ph-map-pin"></i>
                    <p>No hay ningún plano cargado.</p>
                </div>
            </div>
        ` : `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                <div>
                    <span class="plano-cargado-msg" style="margin-top: 0;">
                        <i class="ph ${planoPendiente ? 'ph-warning-circle' : 'ph-check-circle'}" style="color: ${planoPendiente ? '#D97706' : '#16A34A'};"></i> 
                        ${planoPendiente ? 'Vista previa: <strong>' + planoPendiente.name + '</strong>' : 'Plano cargado: <strong>' + (nombreActual || 'plano_evacuacion.pdf') + '</strong>'}
                    </span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-outline" id="btnCambiarPlano">
                        <i class="ph ph-arrow-up"></i> Cambiar
                    </button>
                    ${planoActual ? `
                        <button class="btn btn-sm btn-outline" id="btnEliminarPlano" style="color: #DC2626;">
                            <i class="ph ph-trash"></i> Eliminar
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="visor-container visor-plano-admin" id="visorPlanoAdmin"></div>
            <input type="file" id="inputCambioPlano" accept=".pdf" class="hidden">
            ${planoPendiente ? `
                <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
                    <button class="btn btn-outline btn-sm" id="btnCancelarPlano">
                        <i class="ph ph-arrow-counter-clockwise"></i> Cancelar
                    </button>
                    <button class="btn btn-primary btn-sm" id="btnGuardarPlano">
                        <i class="ph ph-check"></i> Guardar plano
                    </button>
                </div>
            ` : ''}
        `}
    `;
}

function configurarUploadPlanos() {
    const planoActual = obtenerDeStorage("plano_evacuacion_url");

    if (!planoActual && !planoPendiente) {
        // Sin plano guardado ni pendiente: upload inicial
        const uploadArea = document.getElementById("uploadPlano");
        const inputPlano = document.getElementById("inputPlano");

        if (!uploadArea || !inputPlano) return;

        uploadArea.addEventListener("click", () => inputPlano.click());

        inputPlano.addEventListener("change", (event) => {
            const archivo = event.target.files[0];
            if (!archivo) return;
            if (archivo.type !== "application/pdf") {
                alert("Solo se permiten archivos PDF.");
                return;
            }

            planoPendiente = archivo;
            urlPendiente = URL.createObjectURL(archivo);
            cargarSeccion("planos");
            setTimeout(() => inicializarVisorAdmin(urlPendiente), 300);
        });
        return;
    }

    // Mostrar visor Adobe
    const urlMostrar = urlPendiente || planoActual;
    setTimeout(() => inicializarVisorAdmin(urlMostrar), 300);

    // Botón cambiar: abre directamente el selector de archivos
    const btnCambiar = document.getElementById("btnCambiarPlano");
    const inputCambio = document.getElementById("inputCambioPlano");

    if (btnCambiar && inputCambio) {
        btnCambiar.addEventListener("click", () => {
            inputCambio.click();
        });

        inputCambio.addEventListener("change", (event) => {
            const archivo = event.target.files[0];
            if (!archivo) return;
            if (archivo.type !== "application/pdf") {
                alert("Solo se permiten archivos PDF.");
                return;
            }

            planoPendiente = archivo;
            urlPendiente = URL.createObjectURL(archivo);
            cargarSeccion("planos");
            setTimeout(() => inicializarVisorAdmin(urlPendiente), 300);
        });
    }

    // Botón guardar
    const btnGuardar = document.getElementById("btnGuardarPlano");
    const btnCancelar = document.getElementById("btnCancelarPlano");

    if (btnGuardar && planoPendiente) {
        btnGuardar.addEventListener("click", () => {
            if (confirm("¿Guardar este plano? Se reemplazará el plano actual en la página base.")) {
                guardarEnStorage("plano_evacuacion_url", urlPendiente);
                guardarEnStorage("plano_evacuacion_nombre", planoPendiente.name);
                planoPendiente = null;
                urlPendiente = null;
                alert("Plano guardado correctamente.");
                cargarSeccion("planos");
            }
        });
    }

    // Botón cancelar
    if (btnCancelar && planoPendiente) {
        btnCancelar.addEventListener("click", () => {
            planoPendiente = null;
            urlPendiente = null;
            cargarSeccion("planos");
        });
    }

    // Botón eliminar (solo si hay plano guardado)
    if (planoActual) {
        const btnEliminar = document.getElementById("btnEliminarPlano");
        if (btnEliminar) {
            btnEliminar.addEventListener("click", () => {
                if (confirm("¿Eliminar el plano de evacuación? La página base no mostrará ninguno.")) {
                    localStorage.removeItem("plano_evacuacion_url");
                    localStorage.removeItem("plano_evacuacion_nombre");
                    planoPendiente = null;
                    urlPendiente = null;
                    cargarSeccion("planos");
                }
            });
        }
    }
}

function inicializarVisorAdmin(url) {
    const visor = document.getElementById("visorPlanoAdmin");
    if (!visor || !url) return;

    if (window.AdobeDC) {
        const adobeDCView = new AdobeDC.View({
            clientId: "572d1f01286b4e2fa9aa2091885d5a58",
            divId: "visorPlanoAdmin"
        });
        adobeDCView.previewFile(
            {
                content: { location: { url: url } },
                metaData: { fileName: "Plano de Evacuación", hasDownload: false }
            },
            {
                embedMode: "SIZED_CONTAINER",
                defaultViewMode: "FIT_WIDTH",
                showAnnotationTools: false,
                showPrintPDF: false,
                showDownloadPDF: false,
                showZoomControl: true,
                showThumbnails: true
            }
        );
    } else {
        visor.innerHTML = `<iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>`;
    }
}