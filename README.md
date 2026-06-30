PROYECTO: "ESCUELAS SEGURAS"

DESCRIPCIÓN: Plataforma web y aplicacion mobile de gestión de seguridad e higiene para establecimientos educativos. Permite administrar planos de evacuación, protocolos, contactos de emergencia y recursos complementarios, con control de acceso por roles y reportes del personal.

INTEGRANTES: -LUCIA JIMENEZ(Frontend) -MARTA VIÑABAL(QA/Tester-Frontend) -DARIO SALVADORE(Backend) -BRAIAN ESCALANTE(Backend)

COMO INSTALAR Y EJECUTAR EL PROYECTO:
Requisitos previos: necesitás tener instalado Visual Studio Code con la extensión Live Server, un navegador actualizado como Chrome o Firefox.

Pasos para levantar el proyecto: Primero cloná el repositorio desde GitHub con el comando "git clone y la URL de tu repositorio". Después abrí la carpeta del proyecto en Visual Studio Code. Hacé clic derecho sobre el archivo index.html y seleccioná Open with Live Server. El portal se va a abrir automáticamente en tu navegador en la dirección localhost con puerto 5500.

El proyecto Escuelas Seguras fue desarrollado en su versión web con HTML5, CSS3 y JavaScript, siguiendo una arquitectura modular con separación de responsabilidades. La autenticación y el control de acceso por roles se implementaron con sessionStorage y localStorage. Para la visualización de planos de evacuación en PDF se integró la API de Adobe PDF Embed. Los íconos utilizados son de la librería Phosphor Icons y la tipografía es Inter de Google Fonts. Próximamente se desarrollará la versión mobile, migrando la persistencia de datos a Supabase como backend. El control de versiones se realiza con Git y GitHub.

Credenciales de prueba: admin: admin@sanmiguel.edu.ar  contraseña: admin123. Profesor: profesor@sanmiguel.edu.ar contraseña: profesor123. Estudiante: estudiante@sanmiguel.edu.ar contraseña: estudiante123. Personal: personal@sanmiguel.edu.ar contraseña: personal123.

Nota importante: el proyecto está en fase de desarrollo y actualmente usa localStorage para persistencia de datos en modo prueba. Para la versión mobile se migrará a Supabase como base de datos remota.

    
