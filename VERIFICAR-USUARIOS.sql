-- ============================================================
-- VERIFICACIÓN Y CORRECCIÓN DE LA TABLA USUARIOS
-- ============================================================
-- Ejecuta este script en Supabase SQL Editor para verificar
-- que la tabla usuarios esté correctamente configurada
-- ============================================================

-- 1. Verificar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- 2. Verificar foreign keys
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'usuarios'
    AND tc.constraint_type = 'FOREIGN KEY';

-- ============================================================
-- SI LA TABLA NO EXISTE O TIENE ERRORES, CRÉALA ASÍ:
-- ============================================================

-- DESCOMENTAR SOLO SI NECESITAS RECREAR LA TABLA
/*
-- Eliminar tabla si existe
DROP TABLE IF EXISTS usuarios CASCADE;

-- Crear tabla usuarios
CREATE TABLE usuarios (
  "userId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role UUID REFERENCES roles("roleId") ON DELETE SET NULL,
  institution UUID REFERENCES instituciones("institutionId") ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "modifiedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_active ON usuarios(active);
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_usuarios_institution ON usuarios(institution);

-- Insertar usuario de prueba
INSERT INTO usuarios (name, surname, email, role, institution, active)
VALUES 
  ('Admin', 'Sistema', 'admin@test.com', NULL, NULL, true);
*/
