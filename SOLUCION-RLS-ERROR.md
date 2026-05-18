# ⚠️ Solución: Error RLS en Supabase Storage

## Error
```
StorageApiError: new row violates row-level security policy
```

## Causa
Tu aplicación **NO usa autenticación real de Supabase** (usa localStorage), pero Supabase Storage requiere que el usuario esté autenticado para subir archivos.

## ✅ Solución 1: Hacer el Bucket Público (RÁPIDA - Recomendada)

### Opción A: Desde el Dashboard (más fácil)

1. Ve a tu proyecto en Supabase Dashboard
2. **Storage** → **documentos** (tu bucket)
3. Click en **Settings** (⚙️ engranaje)
4. Activa **"Public bucket"** → Toggle a ON
5. Click **Save**

### Opción B: Desde SQL Editor

```sql
-- Ejecuta esto en Supabase SQL Editor
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documentos';
```

### ✅ Verificación
Después de ejecutar, intenta subir un archivo nuevamente. Debería funcionar.

---

## ✅ Solución 2: Actualizar Políticas RLS (Permite Subida Anónima)

Si NO quieres hacer el bucket público, actualiza las políticas:

```sql
-- 1. ELIMINAR políticas antiguas
DROP POLICY IF EXISTS "Lectura pública de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden subir documentos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar documentos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar documentos" ON storage.objects;

-- 2. CREAR nuevas políticas que permitan operaciones SIN autenticación
CREATE POLICY "Lectura pública de documentos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documentos' );

CREATE POLICY "Subida pública de documentos"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'documentos' );

CREATE POLICY "Actualización pública de documentos"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'documentos' )
WITH CHECK ( bucket_id = 'documentos' );

CREATE POLICY "Borrado público de documentos"
ON storage.objects FOR DELETE
USING ( bucket_id = 'documentos' );
```

**⚠️ NOTA**: Esta solución permite que CUALQUIERA suba/borre archivos. Solo úsala en desarrollo.

---

## 🔐 Solución 3: Implementar Autenticación Real de Supabase (Producción)

Si quieres seguridad real, debes migrar de localStorage a Supabase Auth:

### Cambios necesarios:

1. **Login.jsx** - Usar `supabase.auth.signInWithPassword()`
2. **Register.jsx** - Usar `supabase.auth.signUp()`
3. **Eliminar localStorage** - Usar `supabase.auth.getUser()`

### Ejemplo de Login con Supabase Auth:

```javascript
// En Login.jsx
import { supabase } from '../services/supabaseAuth'

const handleSubmit = async (e) => {
  e.preventDefault()
  
  try {
    // Autenticación real de Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    })
    
    if (error) throw error
    
    // Usuario autenticado correctamente
    console.log('Usuario:', data.user)
    navigate('/dashboard')
  } catch (error) {
    setError(error.message)
  }
}
```

**Ventajas:**
- ✅ Seguridad real
- ✅ Tokens JWT automáticos
- ✅ Storage RLS funciona nativamente
- ✅ Gestión de sesiones
- ✅ Reset de contraseña

**Desventajas:**
- ❌ Requiere refactorizar Login/Register
- ❌ Necesitas tabla `auth.users` configurada
- ❌ Más complejo de implementar

---

## 🎯 Recomendación

### Para Desarrollo/Pruebas
👉 **Usar Solución 1** (Bucket Público) - Es inmediato y simple

### Para Producción
👉 **Usar Solución 3** (Supabase Auth real) - Seguridad adecuada

---

## 📝 ¿Qué Hacer Ahora?

### Paso 1: Aplica Solución 1
```sql
-- En Supabase SQL Editor
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documentos';
```

### Paso 2: Verifica el bucket
```sql
-- Confirma que está público
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'documentos';

-- Debería mostrar: public = true
```

### Paso 3: Intenta subir archivo
Ve a tu aplicación y sube un archivo. Debería funcionar sin errores.

---

## 🐛 Si Sigue Fallando

### Verifica que el bucket existe:
```sql
SELECT * FROM storage.buckets WHERE id = 'documentos';
```

Si NO existe, créalo:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true);
```

### Verifica las políticas:
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects';
```

### Habilita RLS en la tabla objects:
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

---

## 📞 Resumen Ejecutivo

**Problema:** RLS bloqueando subida porque no hay autenticación real

**Solución Inmediata:**
```sql
UPDATE storage.buckets SET public = true WHERE id = 'documentos';
```

**Alternativa:** Ejecutar políticas de la Solución 2

**Largo Plazo:** Implementar Supabase Auth (Solución 3)
