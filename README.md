# 🛡️ Escuelas Seguras - Proyecto Full-Stack

Sistema integral de protección para instituciones educativas desarrollado con **React**, **Express.js** y **Supabase (PostgreSQL)**.

## 📋 Arquitectura del Proyecto

```
proyecto-webapp/
├── backend/          # API REST con Express.js + Supabase
└── frontend/         # SPA con React + Vite
```

### Stack Tecnológico

| Capa | Tecnología | Descripción |
|------|-----------|-------------|
| **Frontend** | React 18 + Vite | Interfaz de usuario moderna y responsiva |
| **Backend** | Express.js | API REST para lógica de negocio |
| **Base de Datos** | Supabase (PostgreSQL) | Base de datos relacional en la nube |
| **Routing** | React Router v6 | Navegación SPA |
| **HTTP Client** | Axios | Comunicación frontend-backend |

---

## 🚀 Inicio Rápido

### Prerrequisitos
- **Node.js** 18+ ([descargar](https://nodejs.org/))
- **npm** o **yarn**
- Cuenta en **Supabase** ([crear gratis](https://supabase.com))

### 1️⃣ Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Ve a **SQL Editor** y ejecuta este script para crear la tabla de ejemplo:

```sql
-- Crear tabla de ejemplos
CREATE TABLE examples (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar datos de prueba
INSERT INTO examples (name, description) VALUES
  ('Ejemplo 1', 'Primera entrada de prueba'),
  ('Ejemplo 2', 'Segunda entrada de prueba');
```

3. Ve a **Settings** → **API** y copia:
   - **Project URL** → Tu URL de Supabase
   - **anon public** → Clave pública anónima
   - **service_role** → Clave de servicio (¡SECRETA!)

### 2️⃣ Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de Supabase:

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-aqui
SUPABASE_SERVICE_KEY=tu-clave-de-servicio-aqui
```

### 3️⃣ Configurar Frontend

```bash
cd frontend
npm install

# Crear archivo .env
cp .env.example .env
```

Edita el archivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4️⃣ Ejecutar el Proyecto

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
El servidor estará en [http://localhost:3000](http://localhost:3000)

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
La aplicación estará en [http://localhost:5173](http://localhost:5173)

---

## 📚 Cómo Funciona la Conexión con Supabase

### 🔌 Flujo de Datos

```
[React Frontend] ←→ [Express Backend] ←→ [Supabase PostgreSQL]
     (Puerto 5173)      (Puerto 3000)         (Nube)
```

### 🔐 Arquitectura de Seguridad

#### ¿Por qué usar Backend como intermediario?

1. **Seguridad de Credenciales**
   - La clave `SERVICE_KEY` de Supabase tiene **acceso total** a la DB
   - **NUNCA** debe exponerse en el frontend (código cliente)
   - El backend actúa como "guardián" seguro

2. **Control de Lógica de Negocio**
   - Validaciones centralizadas en el servidor
   - Reglas de negocio que el cliente no puede saltarse
   - Logging y auditoría de operaciones

3. **Flexibilidad**
   - Puedes cambiar de DB sin modificar el frontend
   - Agregar caché, rate limiting, etc.
   - Integrar múltiples servicios

### 🔄 Ejemplo Completo de Flujo CRUD

#### 1. Usuario crea un registro en el Dashboard

**Frontend (`Dashboard.jsx`):**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  await api.create({ name: 'Test', description: 'Demo' })
  fetchItems() // Recargar lista
}
```

**Servicio API (`api.js`):**
```javascript
create: async (data) => {
  const response = await axios.post('http://localhost:3000/api/examples', data)
  return response.data.data
}
```

**Backend Controller (`exampleController.js`):**
```javascript
exports.create = async (req, res) => {
  const { name, description } = req.body
  
  // Supabase usa el SERVICE_KEY seguro aquí
  const { data, error } = await supabase
    .from('examples')
    .insert([{ name, description }])
    .select()
    .single()
  
  if (error) throw error
  res.json({ success: true, data })
}
```

**Supabase:**
```sql
-- Ejecuta automáticamente:
INSERT INTO examples (name, description) VALUES ('Test', 'Demo');
```

### 📊 Diagrama de Conexión

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  (React - http://localhost:5173)                            │
│                                                             │
│  ┌──────────────┐     ┌──────────────┐                     │
│  │ Dashboard.jsx│────▶│  api.js      │                     │
│  │              │     │ (axios)      │                     │
│  └──────────────┘     └──────┬───────┘                     │
└─────────────────────────────┼─────────────────────────────┘
                               │
                               │ HTTP POST /api/examples
                               │ { name: "Test", ... }
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│  (Express - http://localhost:3000)                          │
│                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐│
│  │ routes/      │────▶│ controllers/ │────▶│ supabase.js ││
│  │ express      │     │ lógica       │     │ (cliente)   ││
│  └──────────────┘     └──────────────┘     └──────┬──────┘│
└─────────────────────────────────────────────────┼─────────┘
                                                   │
                    SUPABASE_SERVICE_KEY (segura)  │
                                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE (PostgreSQL)                   │
│  (https://tu-proyecto.supabase.co)                          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  TABLE: examples                             │          │
│  │  ┌────┬───────┬──────────────┬─────────────┐│          │
│  │  │ id │ name  │ description  │ created_at  ││          │
│  │  ├────┼───────┼──────────────┼─────────────┤│          │
│  │  │ 1  │ Test  │ Demo         │ 2026-04-18  ││          │
│  │  └────┴───────┴──────────────┴─────────────┘│          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 🔑 Credenciales de Supabase Explicadas

| Credencial | Dónde se usa | Permisos | ¿Exponer? |
|------------|--------------|----------|-----------|
| `SUPABASE_URL` | Backend y Frontend | - | ✅ Sí (es pública) |
| `SUPABASE_ANON_KEY` | Frontend (opcional) | Solo lectura con RLS* | ✅ Sí (limitada) |
| `SUPABASE_SERVICE_KEY` | **SOLO Backend** | **Acceso total** | ❌ NUNCA |

*RLS = Row Level Security (seguridad a nivel de fila)

### 🛠️ Configuración de Conexión

**Backend (`config/supabase.js`):**
```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,           // URL del proyecto
  process.env.SUPABASE_SERVICE_KEY    // Clave con acceso total
)

module.exports = supabase
```

**Frontend (opcional para Auth):**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY  // Solo clave pública
)
```

---

## 📡 API Endpoints

### Base URL: `http://localhost:3000/api`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/examples` | Obtener todos los registros |
| GET | `/examples/:id` | Obtener un registro por ID |
| POST | `/examples` | Crear nuevo registro |
| PUT | `/examples/:id` | Actualizar registro |
| DELETE | `/examples/:id` | Eliminar registro |

### Ejemplos de Uso

**Crear registro:**
```bash
curl -X POST http://localhost:3000/api/examples \
  -H "Content-Type: application/json" \
  -d '{"name":"Nuevo","description":"Test"}'
```

**Obtener todos:**
```bash
curl http://localhost:3000/api/examples
```

---

## 🗂️ Estructura Detallada

### Backend
```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js          # Cliente de Supabase
│   ├── controllers/
│   │   └── exampleController.js # Lógica CRUD
│   ├── routes/
│   │   └── exampleRoutes.js     # Definición de rutas
│   ├── middleware/
│   │   ├── errorHandler.js      # Manejo de errores
│   │   └── logger.js            # Logging de requests
│   └── server.js                # Servidor Express
├── .env                          # Variables de entorno (no versionar)
├── .env.example                  # Plantilla de variables
├── .gitignore
├── package.json
└── README.md
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Barra de navegación
│   │   └── Navbar.css
│   ├── pages/
│   │   ├── Home.jsx             # Página de inicio
│   │   ├── Home.css
│   │   ├── Dashboard.jsx        # Dashboard CRUD
│   │   └── Dashboard.css
│   ├── services/
│   │   └── api.js               # Cliente HTTP (axios)
│   ├── App.jsx                  # Componente raíz
│   ├── App.css
│   ├── main.jsx                 # Punto de entrada
│   └── index.css
├── .env
├── .env.example
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 🔒 Seguridad y Mejores Prácticas

### ✅ Hacer
- ✅ Mantener `SERVICE_KEY` solo en el backend
- ✅ Usar HTTPS en producción
- ✅ Implementar Row Level Security (RLS) en Supabase
- ✅ Validar datos en backend y frontend
- ✅ Usar variables de entorno (`.env`)
- ✅ Agregar `.env` al `.gitignore`

### ❌ NO Hacer
- ❌ Exponer `SERVICE_KEY` en el frontend
- ❌ Commitear archivos `.env` al repositorio
- ❌ Confiar solo en validaciones del cliente
- ❌ Dejar puertos abiertos sin firewall en producción

---

## 🚢 Despliegue en Producción

### Backend (Servidor Dedicado)

1. **Instalación en servidor:**
```bash
git clone <tu-repo>
cd proyecto-webapp/backend
npm install --production
```

2. **Configurar variables de entorno:**
```bash
nano .env
# Configurar con URLs de producción
```

3. **Usar PM2 para mantener el servicio activo:**
```bash
npm install -g pm2
pm2 start src/server.js --name "escuelas-backend"
pm2 startup
pm2 save
```

4. **Configurar firewall:**
```bash
# Permitir puerto 3000
sudo ufw allow 3000
```

### Frontend (Vercel/Netlify)

1. **Build:**
```bash
cd frontend
npm run build
```

2. **Deploy en Vercel:**
```bash
npm install -g vercel
vercel --prod
```

3. **Configurar variables de entorno en Vercel:**
   - `VITE_API_URL=https://tu-servidor.com/api`

---

## 📝 Próximos Pasos

- [ ] Implementar autenticación (JWT o Supabase Auth)
- [ ] Agregar roles y permisos de usuario
- [ ] Implementar validación de formularios (Zod/Yup)
- [ ] Agregar tests (Jest, React Testing Library)
- [ ] Configurar CI/CD con GitHub Actions
- [ ] Implementar logging avanzado (Winston)
- [ ] Agregar documentación de API (Swagger)
- [ ] Implementar rate limiting
- [ ] Configurar CORS correctamente para producción
- [ ] Agregar monitoreo de errores (Sentry)

---

## 🆘 Troubleshooting

### Error: "Cannot connect to backend"
- Verifica que el backend esté corriendo en puerto 3000
- Revisa que `VITE_API_URL` apunte a `http://localhost:3000/api`

### Error: "Supabase connection failed"
- Verifica las credenciales en `.env` del backend
- Asegúrate que el proyecto de Supabase esté activo
- Revisa que la tabla `examples` exista

### Error: "CORS policy"
- El backend ya tiene CORS configurado para `localhost:5173`
- Si cambias el puerto del frontend, actualiza `server.js`

---

## 📞 Soporte

Para dudas o problemas:
- Revisa los README de `backend/` y `frontend/`
- Consulta la [documentación de Supabase](https://supabase.com/docs)
- Consulta la [documentación de Vite](https://vitejs.dev/)

---

**Desarrollado con ❤️ para Escuelas Seguras**
