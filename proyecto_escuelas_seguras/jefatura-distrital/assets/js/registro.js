/* ==========================================================================
   REGISTRO.JS - Solicitud de acceso
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registroForm");
    if (form) {
        form.addEventListener("submit", manejarRegistro);
    }
});

function manejarRegistro(event) {
    event.preventDefault();

    const nombre = document.getElementById("regNombre").value.trim();
    const usuario = document.getElementById("regUsuario").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const rol = document.getElementById("regRol").value;
    const errorDiv = document.getElementById("registroError");
    const exitoDiv = document.getElementById("registroExito");

    if (!nombre || !usuario || !password || !rol) {
        mostrarError(errorDiv, "Completá todos los campos.");
        return;
    }

    if (password.length < 6) {
        mostrarError(errorDiv, "La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    // Verificar si ya existe una solicitud con ese email
    const pendientes = obtenerDeStorage("solicitudes_pendientes") || [];
    const aprobados = obtenerDeStorage("usuarios_aprobados") || [];
    const adminUsers = JSON.parse(localStorage.getItem("usuarios_admin") || "[]");

    const yaExiste = pendientes.find(s => s.usuario === usuario) ||
                     aprobados.find(u => u.usuario === usuario) ||
                     adminUsers.find(u => u.usuario === usuario);

    if (yaExiste) {
        mostrarError(errorDiv, "Ya existe una solicitud o usuario con ese email.");
        return;
    }

    ocultarError(errorDiv);

    pendientes.push({
        id: generarId(),
        nombre,
        usuario,
        password,
        rol,
        fecha: new Date().toISOString().split("T")[0],
        estado: "pendiente"
    });

    guardarEnStorage("solicitudes_pendientes", pendientes);

    exitoDiv.textContent = "Solicitud enviada correctamente. El administrador la revisará pronto.";
    exitoDiv.classList.remove("hidden");
    document.getElementById("registroForm").reset();
}