/* ==========================================================================
   DASHBOARD_MAIN.JS - Inicialización y navegación del dashboard admin
   ========================================================================== */

/* ==========================================================================
   DATOS INICIALES (si no existen en localStorage)
   ========================================================================== */

function inicializarDatosDefault() {
    if (!obtenerDeStorage("contactos_emergencia")) {
        const contactosDefault = [
            { id: generarId(), nombre: "Bomberos", numero: "100 / 4664-2222" },
            { id: generarId(), nombre: "Emergencias Médicas", numero: "107" },
            { id: generarId(), nombre: "Policía", numero: "911" },
            { id: generarId(), nombre: "Defensa Civil", numero: "103" },
            { id: generarId(), nombre: "Dirección del Establecimiento", numero: "4664-1234" }
        ];
        guardarEnStorage("contactos_emergencia", contactosDefault);
    }

    if (!obtenerDeStorage("protocolos")) {
        const protocolosDefault = [
            {
                id: generarId(),
                titulo: "Protocolo de Incendio",
                descripcion: "Procedimiento paso a paso ante focos de incendio: detección temprana, uso de matafuegos, roles del personal durante la evacuación y puntos de reunión establecidos. Incluye listado de equipamiento contra incendios disponible en cada planta.",
                archivo_url: ""
            },
            {
                id: generarId(),
                titulo: "Emergencia Médica y RCP",
                descripcion: "Guía de primeros auxilios para situaciones críticas: reanimación cardiopulmonar (RCP), maniobra de Heimlich, control de hemorragias y estabilización hasta la llegada de servicios de emergencia. Incluye ubicación de botiquines y DEA.",
                archivo_url: ""
            },
            {
                id: generarId(),
                titulo: "Sismo",
                descripcion: "Procedimiento de evacuación por movimiento sísmico: zonas seguras dentro del edificio, protocolo de repliegue, corte de suministros y verificación posterior de estructuras. Incluye croquis de zonas seguras por piso.",
                archivo_url: ""
            },
            {
                id: generarId(),
                titulo: "Fuga de Gas",
                descripcion: "Protocolo de actuación ante pérdidas de gas: ventilación inmediata, corte de llaves de paso, prohibición de fuentes de ignición y notificación a la empresa proveedora. Plano con ubicación de llaves de corte de gas.",
                archivo_url: ""
            },
            {
                id: generarId(),
                titulo: "Corte de Suministro Eléctrico",
                descripcion: "Procedimiento ante cortes de luz prolongados: activación de luces de emergencia, verificación de tableros, equipos críticos que requieren respaldo y listado de contactos de la empresa distribuidora.",
                archivo_url: ""
            }
        ];
        guardarEnStorage("protocolos", protocolosDefault);
    }

    if (!obtenerDeStorage("recursos")) {
        const recursosDefault = [
            {
                id: generarId(),
                titulo: "Guía de Seguridad Escolar",
                descripcion: "Documento integral con normativas vigentes del Ministerio de Educación. Abarca requisitos edilicios, conformación de brigadas, cronograma de simulacros obligatorios y marco legal aplicable a establecimientos educativos.",
                archivo_url: ""
            },
            {
                id: generarId(),
                titulo: "Video Instructivo de RCP",
                descripcion: "Material audiovisual con demostración práctica de reanimación cardiopulmonar en adultos y niños. Duración: 12 minutos. Producido por la Asociación de Cardiología.",
                archivo_url: ""
            },
            {
                id: generarId(),
                titulo: "Cronograma de Simulacros 2024",
                descripcion: "Calendario anual con fechas programadas de simulacros de evacuación, capacitaciones obligatorias para el personal y jornadas de concientización con la comunidad educativa.",
                archivo_url: ""
            }
        ];
        guardarEnStorage("recursos", recursosDefault);
    }
}

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

    inicializarDatosDefault();
    inicializarDashboard(sesion);
});

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
   SIDEBAR
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
        case "planos":
            contenedor.innerHTML = renderizarPlanos();
            configurarUploadPlanos();
            break;
        case "contactos":
            contenedor.innerHTML = renderizarContactos();
            configurarEventosContactos();
            break;
        case "protocolos":
            contenedor.innerHTML = renderizarProtocolos();
            configurarEventosProtocolos();
            break;
        case "recursos":
            contenedor.innerHTML = renderizarRecursos();
            configurarEventosRecursos();
            break;
        case "novedades":
            contenedor.innerHTML = renderizarNovedades();
            configurarEventosNovedades();
            break;
        case "solicitudes":
            contenedor.innerHTML = renderizarSolicitudes();
            configurarEventosSolicitudes();
            break;
        default:
            contenedor.innerHTML = renderizarInicio();
    }
}