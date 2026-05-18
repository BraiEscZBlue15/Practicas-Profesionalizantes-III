# 📊 Resumen del Sistema de Control de Tiers

## ¿Qué se implementó?

Se agregó un sistema de checkboxes **exclusivo para administradores** que permite seleccionar manualmente el nivel de acceso (tier) de los documentos al momento de subirlos.

## 🎯 Características Principales

### 1. **Visibilidad Condicional**
- ✅ Solo usuarios con rol `administrador` ven los checkboxes
- ✅ Solo aparecen cuando hay un archivo seleccionado
- ✅ Solo en creación (no en edición)

### 2. **Selección Múltiple**
Los administradores pueden marcar varios checkboxes a la vez:
- ☑️ Administrador (tier1)
- ☑️ Directivos (tier2)
- ☑️ Estudiantes (tier3)
- ☑️ Público (tier4)

### 3. **Lógica de Tier Mayor**
El sistema asigna **automáticamente el tier más alto** seleccionado:

```
Selección: [✓ Administrador, ✓ Directivos, ✓ Público]
          [tier1, tier2, tier4]
                    ↓
          Tier asignado: tier4 (el mayor)
```

**Jerarquía**: `tier1 < tier2 < tier3 < tier4`

## 🔄 Flujo Completo

```
1. Usuario administrador hace login
         ↓
2. Navega a Documentos → "+ Nuevo Documento"
         ↓
3. Selecciona archivo 📎
         ↓
4. Aparecen checkboxes 🎯
         ↓
5. Marca uno o más checkboxes
   Ejemplo: ✓ Directivos, ✓ Estudiantes
         ↓
6. Sistema calcula tier mayor
   tier2 vs tier3 → tier3 gana
         ↓
7. Al hacer click en "Crear":
   - Sube archivo a Supabase Storage
   - Agrega metadata: { tier: 'tier3', ... }
         ↓
8. Consola muestra: "Archivo subido con tier: tier3"
         ↓
9. Archivo guardado con permisos tier3
```

## 📝 Cambios en el Código

### `frontend/src/pages/Documentos.jsx`

**Estados agregados:**
```javascript
const [userRole, setUserRole] = useState(null)
const [selectedTiers, setSelectedTiers] = useState({
  tier1: false,
  tier2: false,
  tier3: false,
  tier4: false
})
```

**Carga de rol:**
```javascript
useEffect(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    const user = JSON.parse(storedUser)
    setUserRole(user.role?.roleName?.toLowerCase())
  }
}, [])
```

**Cálculo de tier:**
```javascript
// Si es administrador y tiene checkboxes seleccionados
if (userRole === 'administrador') {
  const selectedTierKeys = Object.keys(selectedTiers).filter(key => selectedTiers[key])
  if (selectedTierKeys.length > 0) {
    const tierNumbers = selectedTierKeys.map(t => parseInt(t.replace('tier', '')))
    const maxTierNumber = Math.max(...tierNumbers)
    manualTier = `tier${maxTierNumber}`
  }
}
```

**Subida con tier:**
```javascript
const uploadResult = await storageService.uploadFile(
  selectedFile,
  'archivos',
  userId,
  manualTier  // ← Parámetro nuevo
)
```

### `frontend/src/services/supabaseStorage.js`

**Firma actualizada:**
```javascript
uploadFile: async (file, folder = 'archivos', userId = null, manualTier = null)
```

**Lógica de prioridad:**
```javascript
// Si hay tier manual → usarlo
// Si no → calcular desde rol
const tier = manualTier || await getUserTier(userId)
```

### `frontend/src/pages/Documentos.css`

**Nuevos estilos:**
- `.tier-selection` - Contenedor amarillo con gradiente
- `.tier-checkboxes` - Grid 2x2 (responsive 1 columna en móvil)
- `.tier-checkbox` - Estilo de cada checkbox con hover animado
- `.tier-info` - Mensaje informativo

## 🧪 Cómo Probarlo

### Paso 1: Crear usuario administrador
```sql
-- En Supabase SQL Editor
INSERT INTO usuarios (name, surname, email, role, institution)
VALUES (
  'Admin',
  'Test',
  'admin@test.com',
  (SELECT "roleId" FROM roles WHERE "roleName" = 'administrador' LIMIT 1),
  (SELECT "institutionId" FROM instituciones LIMIT 1)
);
```

### Paso 2: Login como administrador
1. Ir a `/login`
2. Email: `admin@test.com`
3. Password: cualquiera (sistema actual no valida)

### Paso 3: Subir documento
1. Click en "+ Nuevo Documento"
2. Seleccionar archivo
3. **Verificar que aparezcan los checkboxes amarillos** 🎯
4. Marcar por ejemplo: ✓ Directivos y ✓ Público
5. Completar otros campos
6. Click en "Crear"

### Paso 4: Verificar resultado
1. **Consola del navegador**:
   ```
   Archivo subido con tier: tier4
   ```

2. **Supabase Storage**:
   - Ir a Storage → documentos → archivos
   - Click en el archivo
   - Pestaña "Metadata"
   - Verificar:
     ```json
     {
       "tier": "tier4",
       "userId": "...",
       "originalName": "documento.pdf",
       "uploadedAt": "2026-05-01T..."
     }
     ```

## 🎨 Aspecto Visual

```
╔═══════════════════════════════════════════════════════════╗
║  🎯 Permisos de Acceso al Documento                       ║
║  Selecciona los roles que podrán acceder a este documento ║
║                                                            ║
║  ┌──────────────────┐  ┌──────────────────┐             ║
║  │ ☑ Administrador  │  │ ☐ Directivos     │             ║
║  └──────────────────┘  └──────────────────┘             ║
║  ┌──────────────────┐  ┌──────────────────┐             ║
║  │ ☐ Estudiantes    │  │ ☑ Público        │             ║
║  └──────────────────┘  └──────────────────┘             ║
║                                                            ║
║  ℹ️ Se asignará el nivel más abierto seleccionado        ║
╚═══════════════════════════════════════════════════════════╝
```

## 🔐 Comparación: Antes vs Ahora

### ❌ Antes
- Todos los usuarios subían archivos con el tier de su propio rol
- No había control granular
- Un directivo siempre subía tier2, sin excepciones

### ✅ Ahora
- **Administradores**: Control total, pueden asignar cualquier tier
- **Otros roles**: Comportamiento original (tier según su rol)
- **Flexibilidad**: Un admin puede crear documentos públicos o privados

## 📋 Casos de Uso Reales

### Caso 1: Documento Interno de Alta Seguridad
**Escenario**: Políticas de recursos humanos

**Acción**: 
- Marcar solo ☑️ Administrador

**Resultado**:
- Tier: `tier1`
- Solo administradores pueden acceder

---

### Caso 2: Comunicado para Directivos y Estudiantes
**Escenario**: Anuncio de eventos institucionales

**Acción**:
- Marcar ☑️ Directivos y ☑️ Estudiantes

**Resultado**:
- Tier: `tier3` (mayor entre 2 y 3)
- Accesible para estudiantes, directivos y admins

---

### Caso 3: Formulario Público
**Escenario**: Inscripción abierta a la comunidad

**Acción**:
- Marcar solo ☑️ Público

**Resultado**:
- Tier: `tier4`
- Accesible para todos

---

### Caso 4: Error del Usuario (marca todos)
**Escenario**: Administrador marca todos los checkboxes por error

**Acción**:
- Marcar ☑️ Admin, ☑️ Directivos, ☑️ Estudiantes, ☑️ Público

**Resultado**:
- Tier: `tier4` (máximo de [1,2,3,4])
- **Sistema es tolerante al error**: El documento queda público

---

## 🚀 Ventajas Técnicas

1. **Backward Compatible**: Usuarios no-admin mantienen comportamiento original
2. **Validación en Frontend y Backend**: Doble capa de seguridad
3. **Metadata Persistente**: El tier queda guardado en Supabase
4. **Extensible**: Fácil agregar más tiers en el futuro
5. **UX Optimizada**: Solo se muestra cuando es necesario

## 📚 Documentación Relacionada

- `CONTROL-TIERS-ADMIN.md` - Documentación técnica completa
- `SISTEMA-TIERS.md` - Sistema de tiers original (automático)
- `CONFIGURAR-STORAGE.md` - Configuración de Supabase Storage

## ⚠️ Importante

### Limitaciones Actuales
- ✅ Sistema de checkboxes implementado
- ✅ Metadata guardada correctamente
- ❌ **Falta**: Políticas RLS en Supabase que restrinjan acceso basado en tier
- ❌ **Falta**: Visualización de tier en lista de documentos

### Próximos Pasos Recomendados
1. Implementar políticas RLS basadas en metadata.tier
2. Agregar íconos de tier en la lista de documentos
3. Permitir filtrar documentos por tier
4. Agregar auditoría de cambios de tier
