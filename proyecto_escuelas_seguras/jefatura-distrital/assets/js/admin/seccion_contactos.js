/* ==========================================================================
   SECCION_CONTACTOS.JS - CRUD de contactos de emergencia
   ========================================================================== */

function renderizarContactos() {
    const contactos = obtenerDeStorage("contactos_emergencia") || [];

    let filas = contactos.map((c, index) => `
        <tr>
            <td>${c.nombre}</td>
            <td>${c.numero}</td>
            <td>
                <button class="btn btn-sm btn-outline btn-editar-contacto" data-index="${index}" title="Editar">
                    <i class="ph ph-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline btn-eliminar-contacto" data-index="${index}" title="Eliminar" style="color: #DC2626;">
                    <i class="ph ph-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");

    return `
        <div class="seccion-header">
            <h2>Contactos de Emergencia</h2>
            <p>Gestioná los números que se muestran en la página base</p>
        </div>
        <button class="btn btn-primary" id="btnNuevoContacto" style="margin-bottom: 1.5rem;">
            <i class="ph ph-plus"></i> Agregar contacto
        </button>
        <div id="formContacto" class="form-interno hidden" style="margin-bottom: 2rem;">
            <input type="hidden" id="contactoId">
            <input type="hidden" id="contactoIndex">
            <div class="form-group">
                <label class="form-label">Nombre</label>
                <input type="text" id="contactoNombre" class="form-input" placeholder="Ej: Bomberos">
            </div>
            <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label">Número</label>
                <input type="text" id="contactoNumero" class="form-input" placeholder="Ej: 100 / 4664-2222">
            </div>
            <div class="form-acciones">
                <button class="btn btn-primary btn-sm" id="btnGuardarContacto">Guardar</button>
                <button class="btn btn-outline btn-sm" id="btnCancelarContacto">Cancelar</button>
            </div>
        </div>
        <div class="tabla-contenedor">
            <table class="tabla tabla-contactos">
                <thead>
                    <tr>
                        <th style="width: 40%;">Nombre</th>
                        <th style="width: 40%;">Número</th>
                        <th style="width: 20%;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas || '<tr><td colspan="3">No hay contactos cargados.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function configurarEventosContactos() {
    const contactos = obtenerDeStorage("contactos_emergencia") || [];
    const btnNuevo = document.getElementById("btnNuevoContacto");
    const btnGuardar = document.getElementById("btnGuardarContacto");
    const btnCancelar = document.getElementById("btnCancelarContacto");
    const formulario = document.getElementById("formContacto");

    // Mostrar formulario nuevo
    if (btnNuevo && formulario) {
        btnNuevo.addEventListener("click", () => {
            document.getElementById("contactoId").value = "";
            document.getElementById("contactoIndex").value = "";
            document.getElementById("contactoNombre").value = "";
            document.getElementById("contactoNumero").value = "";
            formulario.classList.remove("hidden");
            btnNuevo.classList.add("hidden");
        });
    }

    // Cancelar
    if (btnCancelar && formulario && btnNuevo) {
        btnCancelar.addEventListener("click", () => {
            formulario.classList.add("hidden");
            btnNuevo.classList.remove("hidden");
        });
    }

    // Guardar
    if (btnGuardar && formulario && btnNuevo) {
        btnGuardar.addEventListener("click", () => {
            const nombre = document.getElementById("contactoNombre").value.trim();
            const numero = document.getElementById("contactoNumero").value.trim();
            const index = document.getElementById("contactoIndex").value;

            if (!nombre || !numero) {
                alert("Completá todos los campos.");
                return;
            }

            if (index !== "") {
                contactos[parseInt(index)] = {
                    ...contactos[parseInt(index)],
                    nombre,
                    numero
                };
            } else {
                contactos.push({
                    id: generarId(),
                    nombre,
                    numero
                });
            }

            guardarEnStorage("contactos_emergencia", contactos);
            formulario.classList.add("hidden");
            btnNuevo.classList.remove("hidden");
            cargarSeccion("contactos");
        });
    }

    // Editar
    document.querySelectorAll(".btn-editar-contacto").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            const contacto = contactos[parseInt(index)];

            document.getElementById("contactoId").value = contacto.id;
            document.getElementById("contactoIndex").value = index;
            document.getElementById("contactoNombre").value = contacto.nombre;
            document.getElementById("contactoNumero").value = contacto.numero;
            formulario.classList.remove("hidden");
            btnNuevo.classList.add("hidden");
        });
    });

    // Eliminar
    document.querySelectorAll(".btn-eliminar-contacto").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            if (confirm("¿Eliminar este contacto?")) {
                contactos.splice(parseInt(index), 1);
                guardarEnStorage("contactos_emergencia", contactos);
                cargarSeccion("contactos");
            }
        });
    });
}