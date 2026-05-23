/* ==========================================================================
   AUTH.JS - Manejo de autenticación, sesión y roles
   ========================================================================== */

/* ==========================================================================
   USUARIOS DE PRUEBA (luego se reemplaza por backend)
   ========================================================================== */

const USUARIOS = [
    {
        id: 1,
        usuario: "admin@sanmiguel.edu.ar",
        password: "admin123",
        rol: "admin",
        nombre: "Administrador"
    },
    {
        id: 2,
        usuario: "profesor@sanmiguel.edu.ar",
        password: "profesor123",
        rol: "profesor",
        nombre: "María González"
    },
    {
        id: 3,
        usuario: "estudiante@sanmiguel.edu.ar",
        password: "estudiante123",
        rol: "estudiante",
        nombre: "Juan Pérez"
    },
    {
        id: 4,
        usuario: "personal@sanmiguel.edu.ar",
        password: "personal123",
        rol: "personal",
        nombre: "Carlos López"
    }
];

/* ==========================================================================
   CONSTANTES
   ========================================================================== */

const SESSION_KEY = "sesion_jdsm";
const SESSION_EXPIRY = 60 * 60 * 1000;

/* ==========================================================================
   PERMISOS POR ROL
   ========================================================================== */

const PERMISOS = {
    admin: [
        "escuelas_seguras",
        "escuelas_seguras_admin",
        "escuelas_seguras_vista_previa",
        "horizontes",
        "mapa_socio_productivo",
        "documentos",
        "instituciones",
        "recursos",
        "gestion_usuarios"
    ],
    profesor: [
        "escuelas_seguras",
        "escuelas_seguras_carga_material",
        "horizontes",
        "documentos",
        "recursos"
    ],
    estudiante: [
        "escuelas_seguras",
        "escuelas_seguras_descarga",
        "horizontes",
        "recursos"
    ],
    personal: [
        "escuelas_seguras",
        "escuelas_seguras_incidentes",
        "documentos",
        "recursos"
    ]
};

/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const togglePasswordBtn = document.querySelector(".toggle-password");

    if (loginForm) {
        loginForm.addEventListener("submit", manejarLogin);
    }

    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener("click", togglePassword);
    }

    verificarSesion();
});

/* ==========================================================================
   FUNCIONES DE AUTENTICACIÓN
   ========================================================================== */

function manejarLogin(event) {
    event.preventDefault();

    const usuarioInput = document.getElementById("usuario").value.trim();
    const passwordInput = document.getElementById("password").value.trim();
    const rememberCheck = document.querySelector('input[name="remember"]');
    const errorDiv = document.getElementById("loginError");

    if (!usuarioInput || !passwordInput) {
        mostrarError(errorDiv, "Completá todos los campos.");
        return;
    }

    const usuarioEncontrado = USUARIOS.find(
        u => u.usuario === usuarioInput && u.password === passwordInput
    );

    if (!usuarioEncontrado) {
        mostrarError(errorDiv, "Usuario o contraseña incorrectos.");
        return;
    }

    ocultarError(errorDiv);

    const sesion = {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        rol: usuarioEncontrado.rol,
        timestamp: Date.now(),
        recordar: rememberCheck ? rememberCheck.checked : false
    };

    guardarSesion(sesion);
    redirigirPorRol(usuarioEncontrado.rol);
}

function togglePassword() {
    const passwordInput = document.getElementById("password");
    const icon = this.querySelector("i");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("ph-eye");
        icon.classList.add("ph-eye-slash");
    } else {
        passwordInput.type = "password";
        icon.classList.remove("ph-eye-slash");
        icon.classList.add("ph-eye");
    }
}

/* ==========================================================================
   MANEJO DE SESIÓN
   ========================================================================== */

function guardarSesion(sesion) {
    if (sesion.recordar) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    }
}

function obtenerSesion() {
    let sesion = sessionStorage.getItem(SESSION_KEY);

    if (!sesion) {
        sesion = localStorage.getItem(SESSION_KEY);
    }

    if (!sesion) {
        return null;
    }

    try {
        const datos = JSON.parse(sesion);

        if (Date.now() - datos.timestamp > SESSION_EXPIRY) {
            cerrarSesion();
            return null;
        }

        return datos;
    } catch (e) {
        cerrarSesion();
        return null;
    }
}

function verificarSesion() {
    const sesion = obtenerSesion();
    const path = window.location.pathname;

    if (sesion && path.includes("login.html")) {
        redirigirPorRol(sesion.rol);
        return;
    }

    const paginasProtegidas = [
    "escuelas_seguras.html",
    "escuelas_seguras_base_2.html",
    "dashboard.html"
    ];

    if (!sesion && paginasProtegidas.some(p => path.includes(p))) {
        window.location.href = "login.html";
        return;
    }

    if (sesion) {
        window.usuarioActivo = sesion;
    }
}

function cerrarSesion() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    window.usuarioActivo = null;
    window.location.href = "login.html";
}

/* ==========================================================================
   CONTROL DE ACCESO POR ROLES
   ========================================================================== */

function tienePermiso(rol, recurso) {
    const permisosRol = PERMISOS[rol];
    if (!permisosRol) return false;
    return permisosRol.includes(recurso);
}

function protegerSeccion(recurso) {
    const sesion = obtenerSesion();

    if (!sesion) {
        window.location.href = "login.html";
        return false;
    }

    if (!tienePermiso(sesion.rol, recurso)) {
        mostrarAccesoDenegado();
        return false;
    }

    return true;
}

/* ==========================================================================
   REDIRECCIÓN Y UI
   ========================================================================== */

function redirigirPorRol(rol) {
    switch (rol) {
        case "admin":
            window.location.href = "escuelas_seguras.html";
            break;
        default:
            window.location.href = "escuelas_seguras_base_2.html";
            break;
    }
}

function mostrarAccesoDenegado() {
    const main = document.querySelector("main");
    if (main) {
        main.innerHTML = `
            <div class="acceso-denegado">
                <i class="ph ph-lock-key" style="font-size: 4rem; color: var(--text-light);"></i>
                <h2>Acceso denegado</h2>
                <p>No tenés permisos para acceder a esta sección.</p>
                <a href="../index.html" class="btn btn-primary">Volver al inicio</a>
            </div>
        `;
    }
}

/* ==========================================================================
   UTILIDADES
   ========================================================================== */

function mostrarError(elemento, mensaje) {
    if (!elemento) return;
    elemento.textContent = mensaje;
    elemento.classList.remove("hidden");
}

function ocultarError(elemento) {
    if (!elemento) return;
    elemento.textContent = "";
    elemento.classList.add("hidden");
}

window.cerrarSesion = cerrarSesion;