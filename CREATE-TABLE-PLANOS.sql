-- Tabla para gestión de planos de evacuación
-- Ejecutar este SQL en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS planos (
    planoId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    institution UUID REFERENCES instituciones(institutionId) ON DELETE SET NULL,
    createdBy UUID REFERENCES usuarios(userId) ON DELETE SET NULL,
    modifiedBy UUID REFERENCES usuarios(userId) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT now(),
    modifiedAt TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_planos_institution ON planos(institution);
CREATE INDEX IF NOT EXISTS idx_planos_active ON planos(active);
CREATE INDEX IF NOT EXISTS idx_planos_created_at ON planos(createdAt DESC);

-- Comentarios
COMMENT ON TABLE planos IS 'Planos de evacuación por institución';
COMMENT ON COLUMN planos.planoId IS 'ID único del plano (UUID)';
COMMENT ON COLUMN planos.name IS 'Nombre descriptivo del plano';
COMMENT ON COLUMN planos.url IS 'URL del archivo PDF en Supabase Storage';
COMMENT ON COLUMN planos.institution IS 'Referencia a la institución';
COMMENT ON COLUMN planos.createdBy IS 'Usuario que creó el registro';
COMMENT ON COLUMN planos.modifiedBy IS 'Usuario que modificó por última vez';
COMMENT ON COLUMN planos.active IS 'Indica si el registro está activo (soft delete)';
COMMENT ON COLUMN planos.createdAt IS 'Fecha de creación';
COMMENT ON COLUMN planos.modifiedAt IS 'Fecha de última modificación';
