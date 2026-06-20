export const USUARIOS = [
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

export const PERMISOS = {
    // Roles de Supabase (usar minúsculas para comparación)
    'administrador': [
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
    'admin': [  // Alias para administrador
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
    'profesor': [
        "escuelas_seguras",
        "escuelas_seguras_carga_material",
        "horizontes",
        "documentos",
        "recursos"
    ],
    'docente': [  // Alias para profesor
        "escuelas_seguras",
        "escuelas_seguras_carga_material",
        "horizontes",
        "documentos",
        "recursos"
    ],
    'estudiante': [
        "escuelas_seguras",
        "escuelas_seguras_descarga",
        "horizontes",
        "recursos"
    ],
    'usuario': [  // Alias para estudiante/usuario básico
        "escuelas_seguras",
        "escuelas_seguras_descarga",
        "horizontes",
        "recursos"
    ],
    'personal': [
        "escuelas_seguras",
        "escuelas_seguras_incidentes",
        "documentos",
        "recursos"
    ]
};

export const SESSION_KEY = "sesion_jdsm";
export const SESSION_EXPIRY = 60 * 60 * 1000;
