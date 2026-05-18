# 📦 Configuración de Supabase Storage para Carga de Archivos

## 🎯 Pasos para configurar el almacenamiento

### 1. Crear el Bucket en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **Storage**
3. Haz clic en **"Create a new bucket"**
4. Configura el bucket:
   - **Name**: `documentos`
   - **Public bucket**: ✅ Activado (para que los archivos sean accesibles públicamente)
5. Haz clic en **Create bucket**

### 2. Configurar Políticas de Seguridad (RLS)

Por defecto, el bucket tendrá restricciones. Necesitas configurar las políticas:

#### Opción A: Acceso Público (Lectura para todos, escritura autenticada)

Ve a **Storage** → **Policies** del bucket `documentos` y crea estas políticas:

**Política 1: Lectura pública**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documentos' );
```

**Política 2: Subida autenticada**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documentos' 
  AND auth.role() = 'authenticated'
);
```

**Política 3: Borrado autenticado**
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documentos' 
  AND auth.role() = 'authenticated'
);
```

#### Opción B: Acceso Completamente Público (Solo para desarrollo)

Si quieres acceso sin autenticación (NO RECOMENDADO PARA PRODUCCIÓN):

1. Ve a **Storage** → Click en el bucket `documentos`
2. Click en **Policies**
3. Desactiva RLS temporalmente O crea política pública:

```sql
CREATE POLICY "Public Access All"
ON storage.objects FOR ALL
USING ( bucket_id = 'documentos' );
```

### 3. Verificar Configuración

Puedes verificar que el bucket está configurado correctamente:

1. Ve a **Storage** → `documentos`
2. Intenta subir un archivo de prueba manualmente
3. Haz clic en el archivo y copia la URL pública
4. Pega la URL en el navegador - debería mostrarse el archivo

### 4. Configuración del Frontend

El código ya está implementado en:
- `frontend/src/services/supabaseStorage.js` - Servicio de carga
- `frontend/src/pages/Documentos.jsx` - Integración en el formulario

**Importante:** Verifica que el nombre del bucket en el código coincida:
```javascript
// En supabaseStorage.js
const BUCKET_NAME = 'documentos' // Debe coincidir con el nombre en Supabase
```

### 5. Estructura de Archivos

Los archivos se guardarán con esta estructura:
```
documentos/
  └── uploads/
      ├── 1234567890-abc123.pdf
      ├── 1234567891-def456.jpg
      └── ...
```

Cada archivo tiene un nombre único generado con:
- Timestamp
- String aleatorio
- Extensión original

### 6. Uso de la Aplicación

1. Haz clic en **"+ Nuevo Documento"**
2. Selecciona un archivo con el botón **"Seleccionar Archivo"**
3. El nombre y tipo se autocompletarán
4. Completa los demás campos (institución, propietario, etc.)
5. Haz clic en **"Crear"**
6. El archivo se subirá a Supabase Storage y la URL se guardará en la BD

### 7. Límites y Consideraciones

- **Tamaño máximo**: 50MB por archivo (plan gratuito de Supabase)
- **Almacenamiento total**: 1GB (plan gratuito)
- **Tipos de archivo**: Todos permitidos por defecto
- **URL pública**: Los archivos son accesibles mediante URL pública

### 8. Solución de Problemas

#### Error: "new row violates row-level security policy"
- Verifica que las políticas RLS estén configuradas
- O desactiva RLS temporalmente para pruebas

#### Error: "Bucket not found"
- Verifica que el nombre del bucket sea exactamente `documentos`
- Verifica que el bucket exista en Storage

#### Error: "Failed to upload"
- Verifica las credenciales de Supabase en `.env`
- Verifica que el bucket sea público o tengas políticas correctas

### 9. Variables de Entorno Requeridas

Asegúrate de tener en `frontend/.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key-aqui
```

---

## ✅ Checklist de Configuración

- [ ] Bucket `documentos` creado en Supabase Storage
- [ ] Bucket configurado como público
- [ ] Políticas RLS configuradas (o desactivadas para pruebas)
- [ ] Variables de entorno configuradas
- [ ] Frontend corriendo (`npm run dev`)
- [ ] Backend corriendo (`npm start`)
- [ ] Prueba de subida de archivo realizada

---

## 🔗 Recursos Adicionales

- [Documentación Supabase Storage](https://supabase.com/docs/guides/storage)
- [Políticas RLS Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Límites del Plan Gratuito](https://supabase.com/pricing)
