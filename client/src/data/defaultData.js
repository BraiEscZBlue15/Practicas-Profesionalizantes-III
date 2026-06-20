export const inicializarDatosDefault = () => {
    if (!localStorage.getItem("contactos_emergencia")) {
        const contactosDefault = [
            { id: generarId(), nombre: "Bomberos", numero: "100 / 4664-2222" },
            { id: generarId(), nombre: "Emergencias Médicas", numero: "107" },
            { id: generarId(), nombre: "Policía", numero: "911" },
            { id: generarId(), nombre: "Defensa Civil", numero: "103" },
            { id: generarId(), nombre: "Dirección del Establecimiento", numero: "4664-1234" }
        ];
        localStorage.setItem("contactos_emergencia", JSON.stringify(contactosDefault));
    }

    if (!localStorage.getItem("protocolos")) {
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
        localStorage.setItem("protocolos", JSON.stringify(protocolosDefault));
    }

    if (!localStorage.getItem("recursos")) {
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
        localStorage.setItem("recursos", JSON.stringify(recursosDefault));
    }
};

function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
