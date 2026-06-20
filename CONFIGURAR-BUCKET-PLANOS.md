# Configuración del Bucket "planos" en Supabase Storage

## Pasos para crear el bucket

1. **Ir a Supabase Dashboard**
   - Acceder a tu proyecto en `https://supabase.com`
   - Ir a la sección **Storage** en el menú lateral

2. **Crear nuevo bucket**
   - Click en "New bucket"
   - Nombre: `planos`
   - Configuración:
     - ✅ Public bucket (marcar como público)
     - File size limit: 50 MB (o según necesidad)
     - Allowed MIME types: `application/pdf`

3. **Configurar políticas RLS (Row Level Security)**

Si quieres habilitar políticas de seguridad más tarde, ejecuta este SQL:

```sql
-- Permitir lectura pública de planos
CREATE POLICY "Lectura pública de planos"
ON storage.objects FOR SELECT
USING (bucket_id = 'planos');

-- Permitir subida solo a usuarios autenticados
CREATE POLICY "Subida solo usuarios autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'planos' 
  AND auth.role() = 'authenticated'
);

-- Permitir eliminación solo a usuarios autenticados
CREATE POLICY "Eliminación solo usuarios autenticados"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'planos' 
  AND auth.role() = 'authenticated'
);
```

## Verificación

Después de crear el bucket:

1. Ve a Storage → planos
2. Intenta subir un PDF de prueba
3. Copia la URL pública y verifica que se puede acceder

## Estructura de carpetas sugerida

```
planos/
  ├── planos/           # Carpeta para planos de evacuación
  └── otros/            # Carpeta para otros tipos de documentos
```

El servicio `planosStorageService` subirá automáticamente a la carpeta `planos/`.
