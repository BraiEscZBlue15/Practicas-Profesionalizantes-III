# 🔐 Sistema de Tiers por Rol de Usuario

## 📋 Descripción

El sistema asigna automáticamente un **tier** (nivel de acceso) a cada archivo subido basándose en el **rol del usuario** que lo sube. Este tier se almacena en los metadatos del archivo en Supabase Storage.

## 🎯 Mapeo de Roles a Tiers

| Rol           | Tier   | Nivel de Acceso |
|---------------|--------|-----------------|
| Administrador | tier1  | Máximo acceso   |
| Directivo     | tier2  | Alto acceso     |
| Estudiante    | tier3  | Acceso medio    |
| Público       | tier4  | Acceso básico   |

## 🔄 Flujo de Funcionamiento

### 1. Usuario inicia sesión
```javascript
// Login.jsx
- Usuario ingresa email y contraseña
- Sistema busca usuario en BD por email
- Guarda en localStorage: { userId, email, name, surname, role }
```

### 2. Usuario sube un archivo
```javascript
// Documentos.jsx
- Usuario selecciona archivo
- Sistema obtiene userId del localStorage o del campo "createdBy"
- Llama a storageService.uploadFile(file, folder, userId)
```

### 3. Sistema determina el tier
```javascript
// supabaseStorage.js
- getUserTier(userId) consulta el usuario en BD
- Obtiene el rol del usuario
- Mapea el rol a tier según ROLE_TIER_MAP
- Por defecto: tier4 (público) si hay error o no hay userId
```

### 4. Archivo se sube con metadata
```javascript
// Supabase Storage
{
  tier: 'tier1',           // Determinado por rol
  userId: 'uuid-123',      // ID del usuario
  originalName: 'doc.pdf', // Nombre original
  uploadedAt: '2026-05-01T...' // Timestamp
}
```

## 📁 Estructura de Archivos

Los archivos se organizan en la carpeta `archivos/`:

```
documentos/
  └── archivos/
      ├── 1714521234567-abc123.pdf  (tier1 - admin)
      ├── 1714521234568-def456.jpg  (tier2 - directivo)
      ├── 1714521234569-ghi789.docx (tier3 - estudiante)
      └── 1714521234570-jkl012.png  (tier4 - público)
```

## 🛠️ Configuración del Sistema

### Archivo: `supabaseStorage.js`

```javascript
const ROLE_TIER_MAP = {
  'administrador': 'tier1',
  'directivo': 'tier2',
  'estudiante': 'tier3',
  'publico': 'tier4'
}
```

**IMPORTANTE**: Los nombres de roles deben coincidir exactamente con los valores en la tabla `roles` de Supabase (en minúsculas).

### Roles esperados en la BD:

Asegúrate de tener estos roles creados en tu tabla `roles`:

```sql
INSERT INTO roles (roleName, active) VALUES
  ('administrador', true),
  ('directivo', true),
  ('estudiante', true),
  ('publico', true);
```

## 🔍 Verificación del Tier

### En la consola del navegador:
```javascript
// Al subir un archivo verás:
"Archivo subido con tier: tier1"
```

### En Supabase Dashboard:
1. Ve a **Storage** → `documentos` → `archivos`
2. Haz clic en un archivo
3. Ve a la pestaña **Metadata**
4. Deberías ver:
   ```json
   {
     "tier": "tier1",
     "userId": "uuid-del-usuario",
     "originalName": "nombre-archivo.pdf",
     "uploadedAt": "2026-05-01T12:34:56.789Z"
   }
   ```

## 🔧 Casos Especiales

### Usuario sin rol asignado
- **Tier asignado**: `tier4` (público)
- **Razón**: Seguridad por defecto

### Error al obtener usuario
- **Tier asignado**: `tier4` (público)
- **Razón**: Fail-safe para evitar errores

### Usuario no autenticado
- **Tier asignado**: `tier4` (público)
- **Razón**: No hay userId disponible

### Campo "Creado por" vacío
- **Sistema intenta**: Obtener userId del localStorage
- **Si falla**: Usa `tier4` (público)

## 📊 Ejemplo Práctico

### Escenario 1: Administrador sube documento
```
Usuario: admin@escuela.com
Rol: administrador
→ Tier asignado: tier1
```

### Escenario 2: Estudiante sube tarea
```
Usuario: estudiante@escuela.com
Rol: estudiante
→ Tier asignado: tier3
```

### Escenario 3: Usuario sin rol sube archivo
```
Usuario: invitado@escuela.com
Rol: null
→ Tier asignado: tier4 (fallback)
```

## 🚀 Testing

Para probar el sistema:

1. **Crear usuarios con diferentes roles**:
   ```
   - admin@test.com → Rol: administrador
   - director@test.com → Rol: directivo
   - alumno@test.com → Rol: estudiante
   - publico@test.com → Rol: publico
   ```

2. **Iniciar sesión con cada usuario**

3. **Subir un archivo**:
   - Ir a Documentos
   - Click en "+ Nuevo Documento"
   - Seleccionar archivo
   - Completar formulario
   - Click en "Crear"

4. **Verificar tier en consola**:
   - Debería mostrar: "Archivo subido con tier: tierX"

5. **Verificar en Supabase**:
   - Storage → documentos → archivos
   - Ver metadata del archivo

## ⚠️ Notas Importantes

1. **Nombres de roles**: Deben estar en minúsculas en el código (se normalizan automáticamente)
2. **Sincronización**: Asegúrate de que los roles en BD coincidan con ROLE_TIER_MAP
3. **Performance**: El tier se calcula en cada subida (considera cachear si hay muchas subidas)
4. **Seguridad**: El tier está en metadata, no afecta permisos de Storage (configúralos aparte)

## 🔐 Políticas de Acceso (Próximos pasos)

Puedes usar el tier en políticas RLS de Supabase Storage:

```sql
-- Ejemplo: Solo tier1 y tier2 pueden eliminar archivos
CREATE POLICY "Solo admins y directivos pueden borrar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documentos' 
  AND (metadata->>'tier' = 'tier1' OR metadata->>'tier' = 'tier2')
);
```

---

**Implementado por**: Sistema de gestión de documentos "Escuelas Seguras"  
**Fecha**: Mayo 2026  
**Versión**: 1.0
