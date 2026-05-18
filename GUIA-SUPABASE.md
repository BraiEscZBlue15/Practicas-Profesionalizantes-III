# 🔌 Guía Completa: Conexión con Supabase

## 📖 Índice
1. [¿Qué es Supabase?](#qué-es-supabase)
2. [¿Cómo funciona la conexión?](#cómo-funciona-la-conexión)
3. [Flujo de datos completo](#flujo-de-datos-completo)
4. [Credenciales explicadas](#credenciales-explicadas)
5. [Ejemplo práctico paso a paso](#ejemplo-práctico-paso-a-paso)
6. [Seguridad: ¿Por qué usar Backend?](#seguridad-por-qué-usar-backend)

---

## 🎯 ¿Qué es Supabase?

**Supabase** es una alternativa open-source a Firebase que te da:
- ✅ **Base de datos PostgreSQL** en la nube (gratis hasta 500 MB)
- ✅ **API REST automática** para tu base de datos
- ✅ **Autenticación** integrada (JWT, OAuth, etc.)
- ✅ **Storage** para archivos
- ✅ **Real-time** subscriptions

### ¿Por qué PostgreSQL?
- Base de datos **relacional** (tablas con relaciones)
- Muy potente y usado en producción
- SQL estándar
- Soporta JSON, triggers, funciones, etc.

---

## 🔄 ¿Cómo funciona la conexión?

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  👤 Usuario en Navegador                                        │
│     (http://localhost:5173)                                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  FRONTEND (React)                        │  │
│  │                                                          │  │
│  │  • Dashboard.jsx: formulario y lista                    │  │
│  │  • api.js: envía requests HTTP                          │  │
│  │  • axios → POST/GET/DELETE                              │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            │ HTTP Request
                            │ POST /api/examples
                            │ { name: "Test" }
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🖥️  Servidor Express (Backend)                                 │
│     (http://localhost:3000)                                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               BACKEND (Express.js)                       │  │
│  │                                                          │  │
│  │  1️⃣ server.js: recibe request                            │  │
│  │  2️⃣ exampleRoutes.js: rutea a /api/examples             │  │
│  │  3️⃣ exampleController.js: lógica de negocio             │  │
│  │  4️⃣ supabase.js: cliente con SERVICE_KEY                │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            │ Supabase API Call
                            │ INSERT INTO examples ...
                            │ (con SERVICE_KEY segura)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ☁️  Supabase (Nube)                                            │
│     (https://tu-proyecto.supabase.co)                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           PostgreSQL Database                            │  │
│  │                                                          │  │
│  │  TABLE: examples                                        │  │
│  │  ┌────┬──────────┬────────────────┬────────────────┐   │  │
│  │  │ id │ name     │ description    │ created_at     │   │  │
│  │  ├────┼──────────┼────────────────┼────────────────┤   │  │
│  │  │ 1  │ Test     │ Descripción    │ 2026-04-18     │   │  │
│  │  │ 2  │ Otro     │ Más datos      │ 2026-04-18     │   │  │
│  │  └────┴──────────┴────────────────┴────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Flujo de Datos Completo

### Ejemplo: Usuario crea un nuevo registro

#### **PASO 1: Usuario hace clic en "Crear"**

```javascript
// Dashboard.jsx (Frontend)
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Llama al servicio API
  await api.create({ 
    name: 'Escuela Primaria 123',
    description: 'Nueva escuela registrada'
  })
  
  fetchItems() // Recarga la lista
}
```

#### **PASO 2: Servicio API envía HTTP Request**

```javascript
// services/api.js (Frontend)
create: async (data) => {
  const response = await axios.post(
    'http://localhost:3000/api/examples',
    data  // { name: '...', description: '...' }
  )
  return response.data.data
}
```

**🔴 Esto envía:**
```http
POST http://localhost:3000/api/examples
Content-Type: application/json

{
  "name": "Escuela Primaria 123",
  "description": "Nueva escuela registrada"
}
```

#### **PASO 3: Backend recibe y procesa**

```javascript
// server.js (Backend)
app.use('/api/examples', exampleRoutes)
```

```javascript
// routes/exampleRoutes.js (Backend)
router.post('/', exampleController.create)
```

```javascript
// controllers/exampleController.js (Backend)
exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body
    
    // 🔑 Aquí se usa la SERVICE_KEY (segura)
    const { data, error } = await supabase
      .from('examples')
      .insert([{ name, description }])
      .select()
      .single()
    
    if (error) throw error
    
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
```

#### **PASO 4: Supabase ejecuta SQL**

Internamente, Supabase ejecuta:
```sql
INSERT INTO examples (name, description, created_at) 
VALUES (
  'Escuela Primaria 123', 
  'Nueva escuela registrada',
  NOW()
)
RETURNING *;
```

#### **PASO 5: Respuesta de vuelta**

```javascript
// Backend responde al Frontend
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Escuela Primaria 123",
    "description": "Nueva escuela registrada",
    "created_at": "2026-04-18T15:30:00Z"
  }
}
```

#### **PASO 6: Frontend actualiza la UI**

```javascript
// Dashboard.jsx actualiza el estado
fetchItems() // GET /api/examples

// React re-renderiza la lista con el nuevo elemento
```

---

## 🔑 Credenciales Explicadas

### 1. **SUPABASE_URL**
```
https://abcdefgh12345678.supabase.co
```
- ✅ **Pública** - Puedes compartirla
- Es la dirección de tu proyecto en Supabase
- Se usa tanto en frontend como backend

### 2. **SUPABASE_ANON_KEY** (Anónima Pública)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```
- ✅ **Pública** - Puedes incluirla en tu app web
- **Permisos limitados**: solo lo que permitas con RLS (Row Level Security)
- Se usa principalmente si implementas Auth de Supabase en el frontend

### 3. **SUPABASE_SERVICE_KEY** (Clave de Servicio)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```
- ❌ **SECRETA** - ¡NUNCA exponerla!
- **Acceso total**: puede leer/escribir/eliminar TODO
- **Solo en backend** - Nunca en código del frontend
- Es como la contraseña de administrador de la DB

### 📋 Tabla Comparativa

| Credencial             | Ubicación           | Permisos     | Exponer       |
|------------------------|---------------------|--------------|---------------|
| `SUPABASE_URL`         |  Backend + Frontend | ------------ |   ✅ Sí      |
| `SUPABASE_ANON_KEY`    | Frontend (opcional) | Solo con RLS |   ✅ Sí      |
| `SUPABASE_SERVICE_KEY` |    **Solo Backend** |  **Total**   | ❌ **NUNCA** |

---

## 🔐 Seguridad: ¿Por qué usar Backend?

### ❓ ¿Por qué NO conectar React directamente a Supabase?

```
❌ MAL - Conexión directa (INSEGURO)

[React Frontend] ←─────────────→ [Supabase]
    (con SERVICE_KEY expuesta)
    
🚨 PROBLEMA: Cualquiera puede ver tu SERVICE_KEY en el código fuente
   del navegador y tener acceso total a tu base de datos!
```

```
✅ BIEN - Con Backend intermediario (SEGURO)

[React Frontend] ←→ [Express Backend] ←→ [Supabase]
                    (SERVICE_KEY aquí)
                    
✅ BENEFICIO: La clave secreta nunca sale del servidor
```

### 🛡️ Ventajas del Backend

#### 1. **Seguridad de Credenciales**
- La `SERVICE_KEY` vive solo en el servidor
- El usuario nunca puede verla en el navegador
- Incluso si alguien inspecciona tu código JS, no la encontrará

#### 2. **Lógica de Negocio Centralizada**
```javascript
// Backend puede validar y procesar
exports.create = async (req, res) => {
  const { name } = req.body
  
  // ✅ Validación en servidor (el cliente no puede saltarla)
  if (!name || name.length < 3) {
    return res.status(400).json({ error: 'Nombre muy corto' })
  }
  
  // ✅ Lógica adicional (ej: enviar email, logging, etc.)
  await sendNotificationEmail(name)
  
  // Luego guarda en DB
  const { data } = await supabase.from('examples').insert([{ name }])
  res.json({ data })
}
```

#### 3. **Flexibilidad**
- Puedes cambiar de Supabase a otra DB sin tocar el frontend
- Agregar caché (Redis)
- Implementar rate limiting
- Integrar con otros servicios (Stripe, SendGrid, etc.)

#### 4. **Auditoría y Logging**
```javascript
// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date()}] ${req.method} ${req.url}`)
  next()
})
```

---

## 📝 Ejemplo Práctico Paso a Paso

### Configuración Inicial

#### 1. **Crear proyecto en Supabase**

1. Ve a [supabase.com](https://supabase.com)
2. Crea cuenta (gratis)
3. **New Project**:
   - Name: `escuelas-seguras`
   - Database Password: (guárdala)
   - Region: South America

#### 2. **Crear tabla de ejemplo**

En **SQL Editor**, ejecuta:

```sql
CREATE TABLE examples (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Datos de prueba
INSERT INTO examples (name, description) VALUES
  ('Escuela 1', 'Primera escuela de prueba'),
  ('Escuela 2', 'Segunda escuela de prueba');
```

#### 3. **Copiar credenciales**

**Settings** → **API**:
- Copia `Project URL` → `SUPABASE_URL`
- Copia `anon public` → `SUPABASE_ANON_KEY`
- Copia `service_role` → `SUPABASE_SERVICE_KEY`

#### 4. **Configurar Backend**

Crea `backend/.env`:
```env
PORT=3000
SUPABASE_URL=https://abcdefgh12345678.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...  ← ¡SECRETA!
```

#### 5. **Instalar y ejecutar**

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

#### 6. **Probar la conexión**

Abre [http://localhost:5173](http://localhost:5173) y:
1. Ve al **Dashboard**
2. Verás los 2 registros de prueba cargados desde Supabase
3. Crea un nuevo registro
4. Recarga la página → ¡El nuevo registro persiste!

---

## 🧪 Verificar que Funciona

### Test 1: Ver datos desde Supabase

**Terminal:**
```bash
curl http://localhost:3000/api/examples
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Escuela 1",
      "description": "Primera escuela de prueba",
      "created_at": "2026-04-18T12:00:00Z"
    },
    {
      "id": 2,
      "name": "Escuela 2",
      "description": "Segunda escuela de prueba",
      "created_at": "2026-04-18T12:00:00Z"
    }
  ]
}
```

### Test 2: Crear registro

```bash
curl -X POST http://localhost:3000/api/examples \
  -H "Content-Type: application/json" \
  -d '{"name":"Escuela Nueva","description":"Creada desde terminal"}'
```

Ve a Supabase **Table Editor** → `examples` y verás el nuevo registro.

---

## 🎓 Resumen

### Lo que necesitas saber:

1. **Supabase = PostgreSQL en la nube** 
   - Gratis hasta 500 MB
   - API REST automática

2. **El Backend protege tus credenciales**
   - SERVICE_KEY nunca sale del servidor
   - El frontend solo habla con tu backend

3. **Flujo de datos:**
   ```
   React → Express → Supabase → PostgreSQL
   ```

4. **Credenciales:**
   - `SUPABASE_URL`: pública ✅
   - `SUPABASE_ANON_KEY`: pública pero limitada ✅
   - `SUPABASE_SERVICE_KEY`: **SOLO backend** ❌

5. **Para conectarse:**
   ```javascript
   // Backend
   const supabase = createClient(URL, SERVICE_KEY)
   ```

### Próximos pasos recomendados:

- [ ] Agregar más tablas (usuarios, escuelas, alertas)
- [ ] Implementar relaciones entre tablas (foreign keys)
- [ ] Agregar autenticación (Supabase Auth)
- [ ] Configurar Row Level Security (RLS)
- [ ] Aprender consultas avanzadas (joins, filters)

---

**¿Dudas?** Revisa:
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de PostgreSQL](https://supabase.com/docs/guides/database)
- Los README de `backend/` y `frontend/`
