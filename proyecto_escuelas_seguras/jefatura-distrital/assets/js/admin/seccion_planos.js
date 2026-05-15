/* ==========================================================================
   SECCION_PLANOS.JS - Upload y previsualización de planos
   ========================================================================== */

function renderizarPlanos() {
    const planoActual = obtenerDeStorage("plano_evacuacion_url");

    return `
        <div class="seccion-header">
            <h2>Plano de Evacuación</h2>
            <p>Subí el PDF que se mostrará en la página base</p>
        </div>
        <div class="upload-area" id="uploadPlano">
            <i class="ph ph-cloud-arrow-up"></i>
            <p>Arrastrá un archivo PDF o hacé clic para cargar</p>
            <p class="upload-hint">Solo archivos PDF. Máximo 10 MB.</p>
            <input type="file" id="inputPlano" accept=".pdf">
        </div>
        ${planoActual ? `
            <div class="visor-container visor-plano-admin" id="visorPlanoAdmin"></div>
            <p class="plano-cargado-msg">
                <i class="ph ph-check-circle"></i> 
                Plano cargado. Se muestra en la página base.
            </p>
        ` : `
            <div class="visor-container visor-plano-vacio">
                <div class="visor-placeholder">
                    <i class="ph ph-map-pin"></i>
                    <p>No hay ningún plano cargado.</p>
                </div>
            </div>
        `}
    `;
}

function configurarUploadPlanos() {
    const uploadArea = document.getElementById("uploadPlano");
    const inputPlano = document.getElementById("inputPlano");

    if (!uploadArea || !inputPlano) return;

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
        guardarEnStorage("plano_evacuacion_url", url);

        cargarSeccion("planos");

        const visor = document.getElementById("visorPlanoAdmin");
        if (visor) {
            setTimeout(() => {
                visor.innerHTML = `<iframe src="${url}" title="Previsualización del plano"></iframe>`;
            }, 100);
        }
    });
}