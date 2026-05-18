# 🚀 Inicio Rápido - Escuelas Seguras

## ⚡ Configuración en 5 Minutos

### 1️⃣ Crear proyecto en Supabase
```
1. Ve a https://supabase.com
2. Crea cuenta gratis
3. New Project → "escuelas-seguras"
4. Settings → API → Copia credenciales
```

### 2️⃣ Crear tabla en Supabase
Ejecuta en **SQL Editor**:
```sql
CREATE TABLE examples (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO examples (name, description) VALUES
  ('Ejemplo 1', 'Primera entrada'),
  ('Ejemplo 2', 'Segunda entrada');
```

### 3️⃣ Configurar Backend
```powershell
cd backend
npm install
cp .env.example .env
```

Edita `backend/.env`:
```env
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima
SUPABASE_SERVICE_KEY=tu-clave-de-servicio
```

### 4️⃣ Configurar Frontend
```powershell
cd frontend
npm install
cp .env.example .env
```

Edita `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 5️⃣ Ejecutar

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### 6️⃣ Probar

Abre: [http://localhost:5173](http://localhost:5173)

---

## 📌 Comandos Útiles

### Verificar conexión backend
```powershell
curl http://localhost:3000/api/examples
```

### Crear registro desde terminal
```powershell
curl -X POST http://localhost:3000/api/examples -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"description\":\"Demo\"}"
```

### Reiniciar todo
```powershell
# Ctrl+C en ambas terminales, luego:
cd backend; npm run dev
cd frontend; npm run dev
```

---

## 🆘 Solución de Problemas

### ❌ "Cannot connect to backend"
```powershell
# Verifica que el backend esté corriendo:
curl http://localhost:3000/api/examples
```

### ❌ "Supabase connection failed"
- Revisa credenciales en `backend/.env`
- Verifica que la tabla `examples` exista en Supabase

### ❌ Error de CORS
- El backend ya tiene CORS configurado
- Asegúrate de usar puerto 5173 para el frontend

---

## 📚 Documentación Completa

- **README principal:** `README.md`
- **Guía Supabase:** `GUIA-SUPABASE.md`
- **Backend:** `backend/README.md`
- **Frontend:** `frontend/README.md`

---

**¡Listo para desarrollar! 🎉**
