-- Permitir lectura pública de instituciones y roles para el formulario de registro
-- Ejecutar en el SQL Editor de Supabase

-- Habilitar RLS en instituciones (si no está habilitado)
ALTER TABLE instituciones ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir SELECT público en instituciones activas
DROP POLICY IF EXISTS "Permitir lectura pública de instituciones activas" ON instituciones;
CREATE POLICY "Permitir lectura pública de instituciones activas"
ON instituciones
FOR SELECT
TO anon, authenticated
USING (active = true);

-- Habilitar RLS en roles (si no está habilitado)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir SELECT público en roles activos
DROP POLICY IF EXISTS "Permitir lectura pública de roles activos" ON roles;
CREATE POLICY "Permitir lectura pública de roles activos"
ON roles
FOR SELECT
TO anon, authenticated
USING (active = true);

-- Verificar políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('instituciones', 'roles')
ORDER BY tablename, policyname;
