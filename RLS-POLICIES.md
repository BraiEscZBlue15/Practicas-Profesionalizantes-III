# Configuración de Row Level Security (RLS) Policies

Después de migrar a Supabase directo, **DEBES** configurar las políticas de seguridad (RLS) en tu base de datos Supabase para proteger los datos.

## ⚠️ IMPORTANTE: Habilitar RLS en todas las tablas

Ve a **Supabase Dashboard → Authentication → Policies** y ejecuta:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instituciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
```

---

## 📋 Políticas para la tabla `usuarios`

### 1. SELECT (Ver usuarios)
**Política**: Los usuarios autenticados pueden ver todos los usuarios activos

```sql
CREATE POLICY "usuarios_select_policy" ON usuarios
FOR SELECT
TO authenticated
USING (active = true);
```

### 2. INSERT (Crear usuarios)
**Política**: Permitir creación durante registro (se ejecuta con service_role en el backend)

```sql
CREATE POLICY "usuarios_insert_policy" ON usuarios
FOR INSERT
TO authenticated
WITH CHECK (true);
```

### 3. UPDATE (Actualizar usuarios)
**Política**: Solo administradores pueden actualizar usuarios

```sql
CREATE POLICY "usuarios_update_policy" ON usuarios
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN roles r ON u.role = r."roleId"
    WHERE u."userId" = auth.uid()
    AND r.name = 'administrador'
  )
);
```

### 4. DELETE (Soft delete de usuarios)
**Política**: Solo administradores pueden desactivar usuarios

```sql
CREATE POLICY "usuarios_delete_policy" ON usuarios
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN roles r ON u.role = r."roleId"
    WHERE u."userId" = auth.uid()
    AND r.name = 'administrador'
  )
)
WITH CHECK (active = false);
```

---

## 🎭 Políticas para la tabla `roles`

### SELECT (Ver roles)
**Política**: Todos los usuarios autenticados pueden ver roles activos

```sql
CREATE POLICY "roles_select_policy" ON roles
FOR SELECT
TO authenticated
USING (active = true);
```

**Nota**: Los roles son datos de solo lectura. No necesitan políticas de INSERT/UPDATE/DELETE para usuarios normales.

---

## 🏫 Políticas para la tabla `instituciones`

### 1. SELECT (Ver instituciones)
**Política**: Todos pueden ver instituciones activas

```sql
CREATE POLICY "instituciones_select_policy" ON instituciones
FOR SELECT
TO authenticated
USING (active = true);
```

### 2. INSERT (Crear instituciones)
**Política**: Solo administradores pueden crear instituciones

```sql
CREATE POLICY "instituciones_insert_policy" ON instituciones
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN roles r ON u.role = r."roleId"
    WHERE u."userId" = auth.uid()
    AND r.name = 'administrador'
  )
);
```

### 3. UPDATE (Actualizar instituciones)
**Política**: Solo administradores pueden actualizar

```sql
CREATE POLICY "instituciones_update_policy" ON instituciones
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN roles r ON u.role = r."roleId"
    WHERE u."userId" = auth.uid()
    AND r.name = 'administrador'
  )
);
```

### 4. DELETE (Soft delete de instituciones)
**Política**: Solo administradores pueden desactivar

```sql
CREATE POLICY "instituciones_delete_policy" ON instituciones
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN roles r ON u.role = r."roleId"
    WHERE u."userId" = auth.uid()
    AND r.name = 'administrador'
  )
)
WITH CHECK (active = false);
```

---

## 📄 Políticas para la tabla `documentos`

### 1. SELECT (Ver documentos)
**Política**: Todos los usuarios autenticados pueden ver documentos activos

```sql
CREATE POLICY "documentos_select_policy" ON documentos
FOR SELECT
TO authenticated
USING (active = true);
```

**Opcional - Filtrar por tier del usuario**:
Si quieres que los usuarios solo vean documentos de su tier o inferior:

```sql
CREATE POLICY "documentos_select_by_tier_policy" ON documentos
FOR SELECT
TO authenticated
USING (
  active = true
  AND (
    -- Administradores ven todo (tier1)
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN roles r ON u.role = r."roleId"
      WHERE u."userId" = auth.uid()
      AND r.name = 'administrador'
    )
    OR
    -- Directivos ven tier2, tier3, tier4
    (
      EXISTS (
        SELECT 1 FROM usuarios u
        JOIN roles r ON u.role = r."roleId"
        WHERE u."userId" = auth.uid()
        AND r.name = 'directivo'
      )
      AND tier IN ('tier2', 'tier3', 'tier4')
    )
    -- ... (agregar lógica similar para estudiante y publico)
  )
);
```

### 2. INSERT (Crear documentos)
**Política**: Usuarios autenticados pueden crear documentos

```sql
CREATE POLICY "documentos_insert_policy" ON documentos
FOR INSERT
TO authenticated
WITH CHECK (
  "createdBy" = auth.uid()
);
```

### 3. UPDATE (Actualizar documentos)
**Política**: Solo el dueño o administradores pueden actualizar

```sql
CREATE POLICY "documentos_update_policy" ON documentos
FOR UPDATE
TO authenticated
USING (
  owner = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN roles r ON u.role = r."roleId"
    WHERE u."userId" = auth.uid()
    AND r.name = 'administrador'
  )
);
```

### 4. DELETE (Soft delete de documentos)
**Política**: Solo el dueño o administradores pueden desactivar

```sql
CREATE POLICY "documentos_delete_policy" ON documentos
FOR UPDATE
TO authenticated
USING (
  owner = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN roles r ON u.role = r."roleId"
    WHERE u."userId" = auth.uid()
    AND r.name = 'administrador'
  )
)
WITH CHECK (active = false);
```

---

## 🔐 Políticas para Storage (bucket `documentos`)

Ya configuradas en `STORAGE-POLICIES.sql`, pero revisa que estén activas:

```sql
-- INSERT: Solo usuarios autenticados pueden subir
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

-- SELECT: Todos pueden ver (lectura pública)
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documentos');

-- UPDATE: Solo el dueño puede actualizar metadata
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos' AND auth.uid()::text = owner);

-- DELETE: Solo el dueño puede eliminar
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos' AND auth.uid()::text = owner);
```

---

## ✅ Verificación

Después de aplicar todas las políticas, ejecuta:

```sql
-- Ver todas las políticas activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🚨 Troubleshooting

### Error: "new row violates row-level security policy"
- Verifica que el usuario esté autenticado (`auth.uid()` no sea null)
- Revisa que la política permita la operación (INSERT/UPDATE/DELETE)
- Confirma que `WITH CHECK` coincida con los datos que intentas insertar

### Error: "No rows returned" pero los datos existen
- Verifica que la política `USING` permita al usuario ver esos datos
- Confirma que `active = true` en los datos
- Revisa que el join con roles funcione correctamente

### Los administradores no pueden hacer nada
- Verifica que la tabla `usuarios` tenga el campo `role` con el UUID correcto
- Confirma que el `auth.uid()` coincida con `usuarios.userId`
- Ejecuta manualmente el subquery de la política para ver si retorna datos

---

## 📚 Recursos

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
