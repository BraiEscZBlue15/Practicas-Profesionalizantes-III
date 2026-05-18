# Backend - Escuelas Seguras API

Backend desarrollado con **Express.js** y **Supabase (PostgreSQL)**.

## 🚀 Configuración Inicial

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` basado en `.env.example`:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-publica
SUPABASE_SERVICE_KEY=tu-clave-de-servicio-secreta
```

### 3. Ejecutar el servidor
```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

## 📁 Estructura de Carpetas

```
backend/
├── src/
│   ├── config/          # Configuraciones (Supabase, etc.)
│   ├── controllers/     # Lógica de negocio
│   ├── routes/          # Definición de rutas
│   ├── middleware/      # Middlewares personalizados
│   └── server.js        # Punto de entrada
├── .env.example
├── .gitignore
└── package.json
```

## 🔑 Obtener Credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto o selecciona uno existente
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_KEY` (¡NO compartir!)

## 📝 Endpoints de Ejemplo

### GET /api/examples
Obtiene todos los registros
```bash
curl http://localhost:3000/api/examples
```

### POST /api/examples
Crea un nuevo registro
```bash
curl -X POST http://localhost:3000/api/examples \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Ejemplo"}'
```

### GET /api/examples/:id
Obtiene un registro por ID
```bash
curl http://localhost:3000/api/examples/1
```

### PUT /api/examples/:id
Actualiza un registro
```bash
curl -X PUT http://localhost:3000/api/examples/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Actualizado"}'
```

### DELETE /api/examples/:id
Elimina un registro
```bash
curl -X DELETE http://localhost:3000/api/examples/1
```

## 🗄️ Base de Datos

El proyecto usa **Supabase** (PostgreSQL). Ejemplo de tabla:

```sql
CREATE TABLE examples (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🛡️ Seguridad

- Las claves de servicio (`SUPABASE_SERVICE_KEY`) nunca deben exponerse en el frontend
- Usa Row Level Security (RLS) en Supabase para proteger datos
- Implementa autenticación JWT si es necesario

## 📦 Dependencias Principales

- **express** - Framework web
- **@supabase/supabase-js** - Cliente de Supabase
- **dotenv** - Variables de entorno
- **cors** - CORS para frontend
- **nodemon** - Hot reload en desarrollo
