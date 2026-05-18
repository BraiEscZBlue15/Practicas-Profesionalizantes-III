# Control de Tiers para Administradores

## Descripción General

Este sistema permite que los **administradores** tengan control manual sobre los niveles de acceso (tiers) de los documentos que suben al sistema.

## Funcionamiento

### Para Usuarios Administradores

Cuando un usuario con rol **"administrador"** sube un documento, verá una sección especial con checkboxes para seleccionar los permisos de acceso:

```
🎯 Permisos de Acceso al Documento
Selecciona los roles que podrán acceder a este documento

□ Administrador
□ Directivos
□ Estudiantes
□ Público
```

### Reglas de Selección

1. **Múltiple Selección**: El administrador puede marcar varios checkboxes a la vez.

2. **Tier Mayor Gana**: El sistema asigna automáticamente el tier más alto (abierto) seleccionado:
   - Si selecciona "Público" (tier4) y "Administrador" (tier1) → Se asigna **tier4**
   - Si selecciona "Directivos" (tier2) y "Estudiantes" (tier3) → Se asigna **tier3**
   - Si solo selecciona "Administrador" (tier1) → Se asigna **tier1**

3. **Jerarquía de Tiers** (de menor a mayor):
   ```
   tier1 (Administrador) < tier2 (Directivos) < tier3 (Estudiantes) < tier4 (Público)
   ```
   El tier4 es el más "abierto" y permite el mayor acceso.

### Para Usuarios No Administradores

Los usuarios con roles **directivo**, **estudiante** o **público** NO ven los checkboxes. El sistema asigna automáticamente el tier basándose en su propio rol:

- **Directivo** → sube archivos con tier2
- **Estudiante** → sube archivos con tier3
- **Público** → sube archivos con tier4

## Flujo Técnico

### 1. Detección de Rol

Al cargar el componente, se verifica el rol del usuario desde localStorage:

```javascript
const storedUser = localStorage.getItem('user')
const user = JSON.parse(storedUser)
setUserRole(user.role?.roleName?.toLowerCase())
```

### 2. Renderizado Condicional

Los checkboxes solo se muestran si:
- El usuario es **administrador**
- Hay un archivo seleccionado
- NO se está editando un documento existente

```javascript
{!editingId && userRole === 'administrador' && selectedFile && (
  <div className="tier-selection">
    {/* Checkboxes aquí */}
  </div>
)}
```

### 3. Cálculo de Tier

Al enviar el formulario, si es administrador con checkboxes marcados:

```javascript
if (userRole === 'administrador') {
  const selectedTierKeys = Object.keys(selectedTiers).filter(key => selectedTiers[key])
  if (selectedTierKeys.length > 0) {
    // Obtener números: ['tier2', 'tier4'] → [2, 4]
    const tierNumbers = selectedTierKeys.map(t => parseInt(t.replace('tier', '')))
    
    // Obtener el MAYOR: [2, 4] → 4
    const maxTierNumber = Math.max(...tierNumbers)
    
    // Construir tier: 4 → 'tier4'
    manualTier = `tier${maxTierNumber}`
  }
}
```

### 4. Subida con Tier Manual

El tier calculado se pasa como parámetro a la función de subida:

```javascript
const uploadResult = await storageService.uploadFile(
  selectedFile,    // Archivo
  'archivos',      // Carpeta
  userId,          // Usuario
  manualTier       // Tier manual (si es admin)
)
```

### 5. Prioridad en supabaseStorage.js

```javascript
uploadFile: async (file, folder = 'archivos', userId = null, manualTier = null) => {
  // Si hay tier manual → usarlo
  // Si no → calcular desde rol del usuario
  const tier = manualTier || await getUserTier(userId)
  
  // Subir con metadata
  metadata: { 
    tier: tier,
    userId: userId || 'anonymous',
    originalName: file.name,
    uploadedAt: new Date().toISOString()
  }
}
```

## Ejemplos de Uso

### Ejemplo 1: Documento Solo para Administradores

**Acción**: Marcar solo "Administrador"

**Resultado**: 
- Tier asignado: `tier1`
- Metadata: `{ tier: 'tier1', ... }`
- Solo usuarios con rol `administrador` deberían poder acceder (cuando se implementen políticas RLS)

### Ejemplo 2: Documento para Directivos y Estudiantes

**Acción**: Marcar "Directivos" y "Estudiantes"

**Resultado**:
- Tier asignado: `tier3` (mayor entre 2 y 3)
- Metadata: `{ tier: 'tier3', ... }`
- Accesible para estudiantes (tier3), directivos (tier2) y admins (tier1)

### Ejemplo 3: Documento Público

**Acción**: Marcar solo "Público"

**Resultado**:
- Tier asignado: `tier4`
- Metadata: `{ tier: 'tier4', ... }`
- Accesible para todos los roles

### Ejemplo 4: Selección Múltiple Mixta

**Acción**: Marcar "Administrador", "Directivos", "Estudiantes" y "Público"

**Resultado**:
- Tier asignado: `tier4` (mayor de todos: 1, 2, 3, 4)
- Metadata: `{ tier: 'tier4', ... }`
- Equivalente a marcar solo "Público"

## Estilos y UX

### Diseño Visual

- **Color principal**: Amarillo/Naranja (#f59e0b) - representa privilegios especiales de admin
- **Fondo**: Degradado amarillo suave para destacar la sección
- **Checkboxes**: Grid responsive (2 columnas en desktop, 1 en móvil)
- **Interacción**: Hover con elevación y sombra
- **Indicador**: Mensaje informativo cuando hay selección

### Feedback Visual

```css
.tier-checkbox:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}
```

Cuando se marca un checkbox, el texto se vuelve más grueso:

```css
.tier-checkbox input[type="checkbox"]:checked + span {
  font-weight: 700;
  color: #92400e;
}
```

### Mensaje Informativo

Si hay al menos un checkbox marcado, se muestra:

```
ℹ️ Se asignará el nivel más abierto seleccionado
```

## Verificación

### En Consola del Navegador

Al subir un archivo, verás:

```
Archivo subido con tier: tier3
```

### En Supabase Storage

1. Ir a **Storage** → **documentos** → **archivos**
2. Hacer clic en el archivo subido
3. Ver pestaña **Metadata**
4. Verificar:
   ```json
   {
     "tier": "tier3",
     "userId": "uuid-del-usuario",
     "originalName": "documento.pdf",
     "uploadedAt": "2026-05-01T12:00:00.000Z"
   }
   ```

## Ventajas del Sistema

✅ **Flexibilidad**: Administradores tienen control total sobre permisos

✅ **UX Simple**: Checkboxes intuitivos, selección múltiple permitida

✅ **Lógica Automática**: Seleccionar tier mayor elimina ambigüedad

✅ **Seguridad por Defecto**: Si no se selecciona nada, se usa el tier del usuario

✅ **Preparado para RLS**: Metadata lista para políticas de acceso basadas en roles

## Próximos Pasos

### 1. Implementar Políticas RLS en Supabase

```sql
-- Ejemplo: Solo tier1 y tier2 pueden borrar
CREATE POLICY "tier_based_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documentos' 
  AND (metadata->>'tier' IN ('tier1', 'tier2'))
);

-- Ejemplo: Lectura basada en tier del usuario
CREATE POLICY "tier_based_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documentos'
  -- Aquí se necesitaría una función que compare tier del archivo
  -- con tier del usuario actual
);
```

### 2. Validaciones Adicionales

- Evitar que no administradores accedan a archivos tier1
- Implementar auditoría de cambios de tier
- Añadir logs de quién asignó qué tier a cada archivo

### 3. Mejoras de UI

- Mostrar tier actual en la lista de documentos
- Agregar íconos visuales por tier (🔒 tier1, 🔓 tier4)
- Filtrar documentos por tier en la búsqueda

## Troubleshooting

### Los checkboxes no aparecen

**Causa**: El usuario no es administrador o no hay archivo seleccionado

**Solución**: 
1. Verificar que el usuario esté logueado como administrador
2. Verificar que `localStorage.getItem('user')` contenga `role: { roleName: 'administrador' }`
3. Asegurarse de seleccionar un archivo primero

### El tier no se asigna correctamente

**Causa**: Error en la lógica de cálculo o en la subida

**Solución**:
1. Abrir consola del navegador
2. Buscar el mensaje: `Archivo subido con tier: tierX`
3. Verificar que coincida con la selección
4. Revisar Supabase Storage metadata

### Todos los archivos tienen tier4

**Causa**: El `manualTier` no se está pasando correctamente

**Solución**:
1. Verificar que `userRole === 'administrador'` sea true
2. Revisar que al menos un checkbox esté marcado
3. Agregar console.log antes de uploadFile:
   ```javascript
   console.log('Manual tier:', manualTier)
   ```
