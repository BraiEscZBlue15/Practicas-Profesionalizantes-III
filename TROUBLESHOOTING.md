# 🔧 Guía de Troubleshooting

## Problema 1: No veo los checkboxes de tiers

### Síntomas
- Selecciono archivo pero no aparecen los checkboxes
- Solo veo el selector de archivo

### Diagnóstico
1. Abre DevTools (F12) → Console
2. Busca el log: `👤 Rol del usuario: ...`
3. Verifica qué rol muestra

### Solución A: Si dice "Rol del usuario: undefined" o "null"
Tu usuario no tiene rol asignado.

**Fix:**
```sql
-- En Supabase SQL Editor
UPDATE usuarios
SET role = (SELECT "roleId" FROM roles WHERE "roleName" = 'administrador' LIMIT 1)
WHERE email = 'tu-email@test.com';
```

### Solución B: Si dice "Rol del usuario: publico" o "estudiante"
Solo los administradores ven los checkboxes completos.

**Opciones:**
1. Crear un usuario administrador nuevo
2. Cambiar tu usuario actual a administrador (usa SQL de arriba)

### Solución C: Si no hay logs en consola
El usuario no está en localStorage.

**Fix:**
1. Cerrar sesión
2. Hacer login de nuevo
3. Verificar en consola que muestra el rol

---

## Problema 2: Error al subir archivo

### Error: "Debes iniciar sesión para subir archivos"

**Causa:** No hay sesión de Supabase activa

**Solución:**
1. Cerrar sesión completamente
2. Hacer login de nuevo
3. Verificar en consola:
```javascript
const { data: { session } } = await supabase.auth.getSession()
console.log(session) // Debe mostrar objeto, no null
```

### Error: "new row violates row-level security policy"

**Causa:** Las políticas RLS no permiten la operación

**Solución:**

Ejecutar en Supabase SQL Editor:
```sql
-- Verificar políticas
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects';

-- Si no hay políticas, crearlas:
CREATE POLICY "Usuarios pueden subir documentos"
ON storage.objects FOR INSERT
WITH CHECK ( 
    bucket_id = 'documentos'
    AND auth.role() = 'authenticated'
);
```

### Error: "Bucket not found"

**Solución:**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false);
```

---

## Problema 3: Login no funciona

### Error: "Invalid login credentials"

**Causa 1:** Usuario no existe en Supabase Auth

**Solución:** Registrarse primero en `/register`

**Causa 2:** Contraseña incorrecta

**Solución:** Resetear contraseña o crear usuario nuevo

---

## Problema 4: Registro crea usuario pero login falla

**Causa:** Usuario existe en `auth.users` pero no en tabla `usuarios`

**Diagnóstico:**
```sql
-- Ver si está en auth pero no en tabla
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN usuarios u ON au.id = u."userId"
WHERE u."userId" IS NULL;
```

**Solución:**
```sql
-- Crear registro en tabla usuarios con mismo UUID
INSERT INTO usuarios ("userId", name, surname, email, role, active)
VALUES (
    'uuid-del-auth-users', -- Copiar de la query de arriba
    'Nombre',
    'Apellido',
    'email@test.com',
    (SELECT "roleId" FROM roles WHERE "roleName" = 'publico'),
    true
);
```

---

## Verificación Rápida

Ejecuta esto en consola del navegador:

```javascript
// 1. Verificar localStorage
const user = JSON.parse(localStorage.getItem('user'))
console.log('Usuario:', user)
console.log('Rol:', user?.role?.roleName)

// 2. Verificar sesión de Supabase
const { data } = await supabase.auth.getSession()
console.log('Sesión activa:', !!data.session)

// 3. Verificar que supabase está importado
console.log('Supabase:', typeof supabase)
```

**Resultado esperado:**
```
Usuario: { userId: "...", email: "...", role: { roleName: "administrador" } }
Rol: administrador
Sesión activa: true
Supabase: object
```

---

## Pasos para Solución Completa

### 1. Crear usuario administrador desde cero

```bash
# 1. Ir a registro
http://localhost:5173/register

# 2. Completar:
Email: admin@test.com
Password: admin123456
Nombre: Admin
Apellido: Test

# 3. Después de registrar, en SQL Editor:
UPDATE usuarios
SET role = (SELECT "roleId" FROM roles WHERE "roleName" = 'administrador')
WHERE email = 'admin@test.com';
```

### 2. Login con usuario admin

```bash
http://localhost:5173/login
Email: admin@test.com
Password: admin123456
```

### 3. Verificar en consola

Debes ver:
```
👤 Rol del usuario: administrador
✅ Sesión de Supabase creada: admin@test.com
```

### 4. Ir a Documentos y crear nuevo

Los checkboxes amarillos deben aparecer después de seleccionar archivo.

---

## Logs Útiles

En la consola verás:
```
📤 Iniciando subida de archivo...
  - Archivo: test.pdf
  - UserId: abc-123
  - Manual Tier: tier4
🔐 Sesión de Supabase: ✅ Activa
🎯 Tier asignado: tier4
📂 Ruta del archivo: archivos/123456-xyz.pdf
✅ Archivo subido exitosamente
🔗 URL pública: https://...
```

Si ves ❌ en cualquier paso, ese es el problema.
