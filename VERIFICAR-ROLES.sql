-- Script para verificar la estructura de la tabla roles y los datos

-- 1. Ver la estructura de la tabla roles
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'roles'
ORDER BY ordinal_position;

-- 2. Ver todos los roles que existen
SELECT * FROM roles;

-- 3. Ver un usuario específico y su rol (reemplaza el email)
SELECT 
    u.email,
    u."role" as role_uuid,
    r.*
FROM usuarios u
LEFT JOIN roles r ON r."roleId" = u."role"
WHERE u.email = 'tu-email@ejemplo.com';  -- REEMPLAZA CON TU EMAIL

-- 4. Ver usuarios sin rol asignado
SELECT email, "role"
FROM usuarios
WHERE "role" IS NULL OR "role" = '';

-- 5. Verificar si hay inconsistencias entre usuarios.role y roles.roleId
SELECT 
    u.email,
    u."role" as usuario_role_uuid,
    CASE 
        WHEN r."roleId" IS NULL THEN '❌ ROL NO EXISTE'
        ELSE '✅ ROL ENCONTRADO'
    END as estado
FROM usuarios u
LEFT JOIN roles r ON r."roleId" = u."role"
WHERE u."role" IS NOT NULL;
