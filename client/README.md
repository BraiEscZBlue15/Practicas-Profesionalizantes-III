# Frontend - Escuelas Seguras

Frontend desarrollado con **React + Vite** y conectado a backend Express + Supabase.

## 🚀 Configuración Inicial

### 1. Instalar dependencias
```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` basado en `.env.example`:

```env
# URL del backend
VITE_API_URL=http://localhost:3000/api
```

### 3. Ejecutar el servidor de desarrollo
```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 📁 Estructura de Carpetas

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── assets/          # Imágenes, fuentes, etc.
│   ├── components/      # Componentes reutilizables
│   │   └── Navbar.jsx
│   ├── pages/           # Páginas/vistas
│   │   ├── Home.jsx
│   │   └── Dashboard.jsx
│   ├── services/        # Llamadas a API
│   │   └── api.js
│   ├── App.jsx          # Componente principal
│   ├── App.css
│   ├── main.jsx         # Punto de entrada
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## 🔧 Comandos Disponibles

```bash
# Desarrollo (con hot-reload)
npm run dev

# Build para producción
npm run build

# Vista previa del build
npm run preview

# Linter
npm run lint
```

## 📦 Dependencias Principales

- **React 18** - Biblioteca UI
- **React Router DOM** - Enrutamiento
- **Axios** - Cliente HTTP para API
- **Vite** - Build tool ultra-rápido

## 🎨 Páginas Incluidas

### Home (`/`)
- Hero section con llamada a la acción
- Grid de características principales
- Diseño responsivo y animado

### Dashboard (`/dashboard`)
- Formulario para crear registros
- Lista de registros desde Supabase
- Operaciones CRUD completas (crear, leer, eliminar)
- Manejo de estados (loading, error, vacío)

## 🔌 Conexión con Backend

El archivo `src/services/api.js` gestiona todas las llamadas al backend:

```javascript
import api from './services/api'

// Obtener todos
const items = await api.getAll()

// Crear nuevo
await api.create({ name: 'Test', description: 'Demo' })

// Eliminar
await api.delete(1)
```

## 🌐 Proxy de Desarrollo

El `vite.config.js` incluye un proxy para evitar CORS en desarrollo:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true
  }
}
```

Esto permite hacer peticiones a `/api/examples` en lugar de `http://localhost:3000/api/examples`.

## 🎯 Variables de Entorno

Las variables de entorno en Vite **DEBEN** tener el prefijo `VITE_`:

```env
VITE_API_URL=http://localhost:3000/api
```

Acceso en código:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

## 🚢 Despliegue

### Build para producción
```bash
npm run build
```

Esto genera una carpeta `dist/` lista para deploy en:
- **Vercel** (recomendado)
- **Netlify**
- **GitHub Pages**
- Cualquier servidor estático

### Configuración para producción
1. Actualiza `VITE_API_URL` con la URL de tu servidor backend en producción
2. Ejecuta `npm run build`
3. Sube la carpeta `dist/` a tu hosting

## 🔐 Seguridad

- **NUNCA** expongas claves secretas de Supabase en el frontend
- Solo usa `SUPABASE_ANON_KEY` si implementas Auth de Supabase
- El backend maneja las operaciones sensibles con `SUPABASE_SERVICE_KEY`

## 📱 Responsividad

Todos los componentes son responsive con breakpoints:
- **Desktop:** 1200px+
- **Tablet:** 768px - 1199px
- **Mobile:** < 768px
