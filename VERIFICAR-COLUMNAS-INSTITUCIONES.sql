-- Verificar nombres de columnas en la tabla instituciones
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'instituciones'
ORDER BY ordinal_position;

-- Si las columnas son institutionid (minúsculas), necesitamos adaptar el código
-- Si son institutionId (camelCase), el código anterior está bien
