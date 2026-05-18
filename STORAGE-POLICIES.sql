-- ============================================================
-- CONFIGURACIÓN DE POLÍTICAS PARA SUPABASE STORAGE
-- ============================================================
-- Ejecuta este script en Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Pega este código → Run
-- ============================================================

-- 1. POLÍTICA: Lectura pública (todos pueden ver los archivos)
CREATE POLICY "Lectura pública de documentos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documentos' );

-- 2. POLÍTICA: Subida autenticada (solo usuarios logueados pueden subir)
CREATE POLICY "Usuarios pueden subir documentos"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'documentos' );

-- 3. POLÍTICA: Actualización autenticada
CREATE POLICY "Usuarios pueden actualizar documentos"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'documentos' );

-- 4. POLÍTICA: Borrado autenticado
CREATE POLICY "Usuarios pueden eliminar documentos"
ON storage.objects FOR DELETE
USING ( bucket_id = 'documentos' );

-- ============================================================
-- VERIFICACIÓN: Consulta las políticas creadas
-- ============================================================
-- Ejecuta esto para verificar que se crearon correctamente:

SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%documentos%';

-- ============================================================
-- ALTERNATIVA: Si quieres ACCESO COMPLETAMENTE PÚBLICO
-- ============================================================
-- Solo para desarrollo/pruebas. NO usar en producción.
-- Ejecuta este comando en el Dashboard de Supabase:
-- Storage → documentos → Configuration → Public bucket: ON
