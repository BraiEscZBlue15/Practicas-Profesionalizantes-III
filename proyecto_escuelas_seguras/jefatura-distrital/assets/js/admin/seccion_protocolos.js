/* ==========================================================================
   SECCION_PROTOCOLOS.JS - CRUD de protocolos
   ========================================================================== */

function renderizarProtocolos() {
    const protocolos = obtenerDeStorage("protocolos") || [];

    let filas = protocolos.map((p, index) => `
        <tr>
            <td>${p.titulo}</td>
            <td>${p.descripcion.substring(0, 60)}...</td>
            <td>${p.archivo_url ? '<i class="ph ph-check-circle" style="color: #16A34A;"></i> Cargado' : '<span style="color: var(--text-light);">Sin archivo</span>'}</td>
            <td>
                <button class="btn btn-sm btn-outline btn-editar-protocolo" data-index="${index}" title="Editar">
                    <i class="ph ph-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline btn-eliminar-protocolo" data-index="${index}" title="Eliminar" style="color: #DC2626;">
                    <i class="ph ph-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");

    return `
        <div class="seccion-header">
            <h2>Protocolos Vigentes</h2>
            <p>Gestioná los protocolos que se muestran en la página base</p>
        </div>
        <button class="btn btn-primary" id="btnNuevoProtocolo" style="margin-bottom: 1.5rem;">
            <i class="ph ph-plus"></i> Agregar protocolo
        </button>
        <div id="formProtocolo" class="form-interno hidden" style="margin-bottom: 2rem;">
            <input type="hidden" id="protocoloId">
            <input type="hidden" id="protocoloIndex">
            <div class="form-group">
                <label class="form-label">Título</label>
                <input type="text" id="protocoloTitulo" class="form-input" placeholder="Ej: Protocolo de Incendio">
            </div>
            <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label">Descripción</label>
                <textarea id="protocoloDescripcion" class="form-input" placeholder="Describí el contenido del protocolo..."></textarea>
            </div>
            <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label">Archivo PDF</label>
                <input type="file" id="protocoloArchivo" class="form-input" accept=".pdf" style="padding-left: 0.75rem;">
            </div>
            <div class="form-acciones">
                <button class="btn btn-primary btn-sm" id="btnGuardarProtocolo">Guardar</button>
                <button class="btn btn-outline btn-sm" id="btnCancelarProtocolo">Cancelar</button>
            </div>
        </div>
        <div class="tabla-contenedor">
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Descripción</th>
                        <th>Archivo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas || '<tr><td colspan="4">No hay protocolos cargados.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function configurarEventosProtocolos() {
    const protocolos = obtenerDeStorage("protocolos") || [];
    const btnNuevo = document.getElementById("btnNuevoProtocolo");
    const btnGuardar = document.getElementById("btnGuardarProtocolo");
    const btnCancelar = document.getElementById("btnCancelarProtocolo");
    const formulario = document.getElementById("formProtocolo");

    if (btnNuevo && formulario) {
        btnNuevo.addEventListener("click", () => {
            document.getElementById("protocoloId").value = "";
            document.getElementById("protocoloIndex").value = "";
            document.getElementById("protocoloTitulo").value = "";
            document.getElementById("protocoloDescripcion").value = "";
            document.getElementById("protocoloArchivo").value = "";
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
            const titulo = document.getElementById("protocoloTitulo").value.trim();
            const descripcion = document.getElementById("protocoloDescripcion").value.trim();
            const archivoInput = document.getElementById("protocoloArchivo");
            const index = document.getElementById("protocoloIndex").value;

            if (!titulo || !descripcion) {
                alert("Completá título y descripción.");
                return;
            }

            let archivo_url = "";
            if (index !== "") {
                archivo_url = protocolos[parseInt(index)].archivo_url;
            }

            if (archivoInput.files.length > 0) {
                archivo_url = URL.createObjectURL(archivoInput.files[0]);
            }

            if (index !== "") {
                protocolos[parseInt(index)] = {
                    ...protocolos[parseInt(index)],
                    titulo,
                    descripcion,
                    archivo_url
                };
            } else {
                protocolos.push({
                    id: generarId(),
                    titulo,
                    descripcion,
                    archivo_url
                });
            }

            guardarEnStorage("protocolos", protocolos);
            formulario.classList.add("hidden");
            btnNuevo.classList.remove("hidden");
            cargarSeccion("protocolos");
        });
    }

    document.querySelectorAll(".btn-editar-protocolo").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            const protocolo = protocolos[parseInt(index)];

            document.getElementById("protocoloId").value = protocolo.id;
            document.getElementById("protocoloIndex").value = index;
            document.getElementById("protocoloTitulo").value = protocolo.titulo;
            document.getElementById("protocoloDescripcion").value = protocolo.descripcion;
            formulario.classList.remove("hidden");
            btnNuevo.classList.add("hidden");
        });
    });

    document.querySelectorAll(".btn-eliminar-protocolo").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            if (confirm("¿Eliminar este protocolo?")) {
                protocolos.splice(parseInt(index), 1);
                guardarEnStorage("protocolos", protocolos);
                cargarSeccion("protocolos");
            }
        });
    });
}