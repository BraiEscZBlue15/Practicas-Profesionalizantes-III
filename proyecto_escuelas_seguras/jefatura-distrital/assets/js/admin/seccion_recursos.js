/* ==========================================================================
   SECCION_RECURSOS.JS - CRUD de recursos complementarios
   ========================================================================== */

function renderizarRecursos() {
    const recursos = obtenerDeStorage("recursos") || [];

    let filas = recursos.map((r, index) => `
        <tr>
            <td>${r.titulo}</td>
            <td>${r.tipo || "PDF"}</td>
            <td>${r.descripcion.substring(0, 60)}...</td>
            <td>${r.archivo_url ? '<i class="ph ph-check-circle" style="color: #16A34A;"></i> Cargado' : '<span style="color: var(--text-light);">Sin archivo</span>'}</td>
            <td>
                <button class="btn btn-sm btn-outline btn-editar-recurso" data-index="${index}" title="Editar">
                    <i class="ph ph-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline btn-eliminar-recurso" data-index="${index}" title="Eliminar" style="color: #DC2626;">
                    <i class="ph ph-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");

    return `
        <div class="seccion-header">
            <h2>Recursos Complementarios</h2>
            <p>Gestioná guías, videos y material complementario de la página base</p>
        </div>
        <button class="btn btn-primary" id="btnNuevoRecurso" style="margin-bottom: 1.5rem;">
            <i class="ph ph-plus"></i> Agregar recurso
        </button>
        <div id="formRecurso" class="form-interno hidden" style="margin-bottom: 2rem;">
            <input type="hidden" id="recursoId">
            <input type="hidden" id="recursoIndex">
            <div class="form-group">
                <label class="form-label">Título</label>
                <input type="text" id="recursoTitulo" class="form-input" placeholder="Ej: Video Instructivo de RCP">
            </div>
            <div class="form-fila" style="margin-top: 1rem;">
                <div class="form-group">
                    <label class="form-label">Tipo</label>
                    <select id="recursoTipo" class="form-input" style="padding-left: 0.75rem;">
                        <option value="PDF">PDF</option>
                        <option value="Video">Video (YouTube/Vimeo)</option>
                        <option value="Archivo">Archivo (DOCX, PPTX)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" id="labelRecursoArchivo">Archivo o enlace</label>
                    <input type="text" id="recursoArchivoUrl" class="form-input" placeholder="URL del video o archivo">
                    <input type="file" id="recursoArchivoFile" class="form-input hidden" accept=".pdf,.docx,.pptx,.mp4" style="padding-left: 0.75rem;">
                </div>
            </div>
            <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label">Descripción</label>
                <textarea id="recursoDescripcion" class="form-input" placeholder="Describí el contenido del recurso..."></textarea>
            </div>
            <div class="form-acciones">
                <button class="btn btn-primary btn-sm" id="btnGuardarRecurso">Guardar</button>
                <button class="btn btn-outline btn-sm" id="btnCancelarRecurso">Cancelar</button>
            </div>
        </div>
        <div class="tabla-contenedor">
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Archivo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas || '<tr><td colspan="5">No hay recursos cargados.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function configurarEventosRecursos() {
    const recursos = obtenerDeStorage("recursos") || [];
    const btnNuevo = document.getElementById("btnNuevoRecurso");
    const btnGuardar = document.getElementById("btnGuardarRecurso");
    const btnCancelar = document.getElementById("btnCancelarRecurso");
    const formulario = document.getElementById("formRecurso");

    if (btnNuevo && formulario) {
    btnNuevo.addEventListener("click", () => {
        document.getElementById("recursoId").value = "";
        document.getElementById("recursoIndex").value = "";
        document.getElementById("recursoTitulo").value = "";
        document.getElementById("recursoDescripcion").value = "";
        document.getElementById("recursoArchivoUrl").value = "";
        document.getElementById("recursoArchivoFile").value = "";
        document.getElementById("recursoTipo").value = "PDF";
        document.getElementById("recursoArchivoUrl").classList.add("hidden");
        document.getElementById("recursoArchivoFile").classList.remove("hidden");
        document.getElementById("labelRecursoArchivo").textContent = "Archivo";
        formulario.classList.remove("hidden");
        btnNuevo.classList.add("hidden");
    });
    }

    if (btnCancelar && formulario && btnNuevo) {
        btnCancelar.addEventListener("click", () => {
            formulario.classList.add("hidden");
            btnNuevo.classList.remove("hidden");
        });
    }

    if (btnGuardar && formulario && btnNuevo) {
    btnGuardar.addEventListener("click", () => {
        const titulo = document.getElementById("recursoTitulo").value.trim();
        const descripcion = document.getElementById("recursoDescripcion").value.trim();
        const tipo = document.getElementById("recursoTipo").value;
        const index = document.getElementById("recursoIndex").value;

        if (!titulo || !descripcion) {
            alert("Completá título y descripción.");
            return;
        }

        let archivo_url = "";
        
        if (tipo === "Video") {
            archivo_url = document.getElementById("recursoArchivoUrl").value.trim();
        } else {
            const archivoInput = document.getElementById("recursoArchivoFile");
            if (archivoInput.files.length > 0) {
                archivo_url = URL.createObjectURL(archivoInput.files[0]);
            } else if (index !== "") {
                archivo_url = recursos[parseInt(index)].archivo_url;
            }
        }

        if (index !== "") {
            recursos[parseInt(index)] = {
                ...recursos[parseInt(index)],
                titulo,
                descripcion,
                tipo,
                archivo_url
            };
        } else {
            recursos.push({
                id: generarId(),
                titulo,
                descripcion,
                tipo,
                archivo_url
            });
        }

        guardarEnStorage("recursos", recursos);
        formulario.classList.add("hidden");
        btnNuevo.classList.remove("hidden");
        cargarSeccion("recursos");
    });
}

    document.querySelectorAll(".btn-editar-recurso").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            const recurso = recursos[parseInt(index)];

            document.getElementById("recursoId").value = recurso.id;
            document.getElementById("recursoIndex").value = index;
            document.getElementById("recursoTitulo").value = recurso.titulo;
            document.getElementById("recursoDescripcion").value = recurso.descripcion;
            document.getElementById("recursoTipo").value = recurso.tipo || "PDF";
            
            // Mostrar campo correcto según tipo
            if (recurso.tipo === "Video") {
                document.getElementById("recursoArchivoUrl").value = recurso.archivo_url || "";
                document.getElementById("recursoArchivoUrl").classList.remove("hidden");
                document.getElementById("recursoArchivoFile").classList.add("hidden");
                document.getElementById("labelRecursoArchivo").textContent = "URL del video";
            } else {
                document.getElementById("recursoArchivoUrl").classList.add("hidden");
                document.getElementById("recursoArchivoFile").classList.remove("hidden");
                document.getElementById("labelRecursoArchivo").textContent = "Archivo";
            }
            
            formulario.classList.remove("hidden");
            btnNuevo.classList.add("hidden");
        });
        });

    document.querySelectorAll(".btn-eliminar-recurso").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            if (confirm("¿Eliminar este recurso?")) {
                recursos.splice(parseInt(index), 1);
                guardarEnStorage("recursos", recursos);
                cargarSeccion("recursos");
            }
        });
    });
    // Mostrar campo según tipo seleccionado
    document.getElementById("recursoTipo").addEventListener("change", function() {
        const tipo = this.value;
        const urlInput = document.getElementById("recursoArchivoUrl");
        const fileInput = document.getElementById("recursoArchivoFile");
        const label = document.getElementById("labelRecursoArchivo");
        
        if (tipo === "Video") {
            urlInput.classList.remove("hidden");
            urlInput.placeholder = "Ej: https://www.youtube.com/watch?v=...";
            fileInput.classList.add("hidden");
            label.textContent = "URL del video";
        } else if (tipo === "PDF" || tipo === "Archivo") {
            urlInput.classList.add("hidden");
            fileInput.classList.remove("hidden");
            label.textContent = "Archivo";
        }
    });
}