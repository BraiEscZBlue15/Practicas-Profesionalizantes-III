# 📋 Guía: Implementación de Roles (Solo Lectura)

## ✅ ¿Qué se ha implementado?

Se ha agregado funcionalidad de **solo lectura** para la tabla `roles` de Supabase. Los roles se gestionan directamente desde la base de datos y la aplicación solo puede **consultarlos**, ideal para usarlos en formularios y dropdowns.

---

## 🗄️ Estructura de la Tabla

```sql
create table if not exists public."roles" (
  "roleId" uuid primary key,
  "createdAt" date not null default now(),
  "modifiedAt" date not null default now(),
  "active" boolean not null default true,
  "name" text not null
);
```

### Campos:
- **roleId**: UUID único (clave primaria)
- **createdAt**: Fecha de creación (automática)
- **modifiedAt**: Fecha de última modificación (automática)
- **active**: Indica si el rol está activo (boolean)
- **name**: Nombre del rol (texto)

---

## 📦 Archivos Creados/Modificados

### Backend:
```
backend/src/
├── controllers/
│   └── rolesController.js      ✨ NUEVO - Lógica de lectura de roles
├── routes/
│   └── rolesRoutes.js          ✨ NUEVO - Rutas de roles (GET only)
└── server.js                    ✏️ MODIFICADO - Agregada ruta /api/roles
```

### Frontend:
```
frontend/src/
├── services/
│   └── api.js                   ✏️ MODIFICADO - Agregado rolesService
├── components/
│   ├── RolesExample.jsx         ✨ NUEVO - Ejemplo de uso
│   ├── RolesExample.css         ✨ NUEVO - Estilos del ejemplo
│   └── Navbar.jsx               ✏️ MODIFICADO - Agregado enlace a Roles
└── App.jsx                      ✏️ MODIFICADO - Agregada ruta /roles
```

---

## 🔌 API Endpoints

### Base URL: `http://localhost:3000/api/roles`

| Método | Endpoint | Descripción | Respuesta |
|--------|----------|-------------|-----------|
| GET | `/api/roles` | Todos los roles activos | Array completo |
| GET | `/api/roles/active` | Roles activos (solo id y name) | Array optimizado para selects |
| GET | `/api/roles/:id` | Un rol específico por UUID | Objeto único |

### Ejemplos de Respuesta:

#### GET /api/roles
```json
{
  "success": true,
  "data": [
    {
      "roleId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-04-18",
      "modifiedAt": "2026-04-18",
      "active": true,
      "name": "Administrador"
    },
    {
      "roleId": "650e8400-e29b-41d4-a716-446655440001",
      "createdAt": "2026-04-18",
      "modifiedAt": "2026-04-18",
      "active": true,
      "name": "Usuario"
    }
  ]
}
```

#### GET /api/roles/active (optimizado para dropdowns)
```json
{
  "success": true,
  "data": [
    {
      "roleId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Administrador"
    },
    {
      "roleId": "650e8400-e29b-41d4-a716-446655440001",
      "name": "Usuario"
    }
  ]
}
```

---

## 🚀 Cómo Usar en tus Componentes

### 1. Importar el servicio

```javascript
import { rolesService } from '../services/api'
```

### 2. Cargar roles en un componente

```javascript
import { useState, useEffect } from 'react'
import { rolesService } from '../services/api'

function MiFormulario() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // Usa getActive() para dropdowns (más eficiente)
        const data = await rolesService.getActive()
        setRoles(data)
      } catch (error) {
        console.error('Error al cargar roles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  return (
    <select>
      <option value="">-- Selecciona un rol --</option>
      {roles.map(role => (
        <option key={role.roleId} value={role.roleId}>
          {role.name}
        </option>
      ))}
    </select>
  )
}
```

### 3. Ejemplo completo con formulario

```javascript
function RegistroUsuario() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    roleId: ''
  })
  const [roles, setRoles] = useState([])

  useEffect(() => {
    const fetchRoles = async () => {
      const data = await rolesService.getActive()
      setRoles(data)
    }
    fetchRoles()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Envía el roleId junto con los demás datos
    console.log('Datos a enviar:', formData)
    
    // Ejemplo de cómo enviarías al backend:
    // await api.post('/usuarios', formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.nombre}
        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
        placeholder="Nombre"
        required
      />
      
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
        required
      />
      
      <select
        value={formData.roleId}
        onChange={(e) => setFormData({...formData, roleId: e.target.value})}
        required
      >
        <option value="">-- Selecciona un rol --</option>
        {roles.map(role => (
          <option key={role.roleId} value={role.roleId}>
            {role.name}
          </option>
        ))}
      </select>
      
      <button type="submit">Registrar</button>
    </form>
  )
}
```

---

## 📝 Métodos Disponibles en `rolesService`

### `getAll()`
Obtiene todos los roles activos con todos sus campos.

```javascript
const roles = await rolesService.getAll()
// Retorna: [{ roleId, createdAt, modifiedAt, active, name }, ...]
```

**Cuándo usar:** Cuando necesitas mostrar todos los detalles de los roles.

---

### `getActive()` ⭐ Recomendado para formularios
Obtiene solo `roleId` y `name` de roles activos.

```javascript
const roles = await rolesService.getActive()
// Retorna: [{ roleId, name }, ...]
```

**Cuándo usar:** En selects/dropdowns (más eficiente, menos datos transferidos).

---

### `getById(id)`
Obtiene un rol específico por su UUID.

```javascript
const role = await rolesService.getById('550e8400-e29b-41d4-a716-446655440000')
// Retorna: { roleId, createdAt, modifiedAt, active, name }
```

**Cuándo usar:** Cuando necesitas los detalles completos de un rol específico.

---

## 🗃️ Insertar Roles en Supabase

Los roles se gestionan directamente desde Supabase. Para agregar nuevos roles:

### Opción 1: SQL Editor en Supabase

```sql
-- Insertar un nuevo rol
INSERT INTO public.roles ("roleId", "name")
VALUES (
  gen_random_uuid(),
  'Nombre del Rol'
);

-- Ejemplos:
INSERT INTO public.roles ("roleId", "name") VALUES
  (gen_random_uuid(), 'Administrador'),
  (gen_random_uuid(), 'Director'),
  (gen_random_uuid(), 'Docente'),
  (gen_random_uuid(), 'Personal de Seguridad'),
  (gen_random_uuid(), 'Padre/Madre');
```

### Opción 2: Table Editor en Supabase

1. Ve a **Table Editor** en Supabase
2. Selecciona la tabla `roles`
3. Clic en **Insert row**
4. Completa:
   - **roleId**: Deja que se genere automáticamente (UUID)
   - **name**: Escribe el nombre del rol
   - **active**: Marca como `true`
5. Guarda

---

## 🔒 Seguridad y Validaciones

### Backend (Controller)
- ✅ Solo endpoints de lectura (GET)
- ✅ Filtra automáticamente roles activos (`active = true`)
- ✅ Manejo de errores (404 si no existe)
- ✅ Ordenamiento alfabético por nombre

### Frontend (Service)
- ✅ Manejo de errores con try/catch
- ✅ Loading states en componentes
- ✅ Validación de selección requerida

### Base de Datos
- ✅ Campo `active` permite desactivar roles sin eliminarlos
- ✅ UUID como clave primaria (más seguro que IDs secuenciales)
- ✅ Timestamps automáticos (createdAt, modifiedAt)

---

## 🧪 Probar la Funcionalidad

### 1. Insertar datos de prueba en Supabase

```sql
INSERT INTO public.roles ("roleId", "name") VALUES
  (gen_random_uuid(), 'Administrador'),
  (gen_random_uuid(), 'Usuario'),
  (gen_random_uuid(), 'Invitado');
```

### 2. Probar endpoints con curl

```bash
# Obtener todos los roles
curl http://localhost:3000/api/roles

# Obtener roles activos (optimizado)
curl http://localhost:3000/api/roles/active

# Obtener un rol específico (reemplaza el UUID)
curl http://localhost:3000/api/roles/550e8400-e29b-41d4-a716-446655440000
```

### 3. Probar en el navegador

1. Inicia el backend: `cd backend && npm run dev`
2. Inicia el frontend: `cd frontend && npm run dev`
3. Abre http://localhost:5173/roles
4. Deberías ver el componente de ejemplo con un select de roles

---

## 📊 Ejemplo de Uso Real: Formulario de Registro de Usuario

```javascript
import { useState, useEffect } from 'react'
import { rolesService } from '../services/api'
import api from '../services/api'

function RegistroUsuario() {
  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    roleId: ''
  })
  const [loading, setLoading] = useState(false)

  // Cargar roles al montar
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await rolesService.getActive()
        setRoles(data)
      } catch (error) {
        console.error('Error al cargar roles:', error)
      }
    }
    fetchRoles()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Envía al backend (ejemplo)
      await api.post('/usuarios', formData)
      alert('Usuario registrado exitosamente')
      
      // Limpiar formulario
      setFormData({ nombre: '', email: '', roleId: '' })
    } catch (error) {
      console.error('Error al registrar:', error)
      alert('Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrar Nuevo Usuario</h2>
      
      <div className="form-group">
        <label>Nombre:</label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Rol:</label>
        <select
          value={formData.roleId}
          onChange={(e) => setFormData({...formData, roleId: e.target.value})}
          required
        >
          <option value="">-- Selecciona un rol --</option>
          {roles.map(role => (
            <option key={role.roleId} value={role.roleId}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrar Usuario'}
      </button>
    </form>
  )
}

export default RegistroUsuario
```

---

## 🎯 Mejores Prácticas

### ✅ Hacer:
- ✅ Usar `getActive()` para dropdowns (más eficiente)
- ✅ Manejar estados de loading mientras cargan los roles
- ✅ Validar que se seleccione un rol antes de enviar
- ✅ Guardar solo el `roleId` en otras tablas (no el nombre)
- ✅ Usar el campo `active` para desactivar roles sin eliminarlos

### ❌ Evitar:
- ❌ No hagas queries innecesarias (usa `getActive()` en vez de `getAll()`)
- ❌ No guardes el nombre del rol en otras tablas (solo el `roleId`)
- ❌ No elimines roles directamente, mejor desactívalos (`active = false`)
- ❌ No expongas la funcionalidad de crear/editar roles en el frontend

---

## 🔄 Relaciones con Otras Tablas

Cuando crees otras tablas que necesiten referenciar roles:

```sql
-- Ejemplo: Tabla de usuarios con relación a roles
CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role_id uuid REFERENCES public.roles("roleId"),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📚 Recursos Adicionales

- **Backend Controller:** `backend/src/controllers/rolesController.js`
- **Backend Routes:** `backend/src/routes/rolesRoutes.js`
- **Frontend Service:** `frontend/src/services/api.js` (busca `rolesService`)
- **Componente de Ejemplo:** `frontend/src/components/RolesExample.jsx`

---

## 🆘 Troubleshooting

### Error: "Cannot find module rolesRoutes"
- Asegúrate de que el archivo existe en `backend/src/routes/rolesRoutes.js`
- Verifica que la importación en `server.js` sea correcta

### Error: "relation roles does not exist"
- La tabla `roles` no existe en Supabase
- Ejecuta el script SQL de creación en Supabase SQL Editor

### No se muestran roles en el select
- Verifica que haya roles insertados en Supabase
- Verifica que tengan `active = true`
- Revisa la consola del navegador para errores de API

### Error 404 al llamar a /api/roles
- Asegúrate de que el backend esté corriendo
- Verifica que la ruta esté registrada en `server.js`
- Revisa el puerto (debe ser 3000 por defecto)

---

**¡Listo para usar roles en tu aplicación!** 🎉
