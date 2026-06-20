-- Deshabilitar RLS en la tabla planos
ALTER TABLE planos DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó correctamente
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'planos';

-- Si rowsecurity = false, está deshabilitado correctamente
