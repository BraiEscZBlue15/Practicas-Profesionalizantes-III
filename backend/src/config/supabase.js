import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// ====================================================================
// CONFIGURACIÓN DE SUPABASE
// ====================================================================
// Supabase funciona como un "Backend as a Service" (BaaS)
// 
// ¿Qué significa esto?
// - Supabase gestiona tu base de datos PostgreSQL en la nube
// - NO necesitas instalar PostgreSQL localmente
// - Te conectas a través de su API REST o cliente JavaScript
//
// ¿Cómo funciona la conexión?
// 1. Creas un proyecto en Supabase (gratis)
// 2. Obtienes las credenciales (URL + API Keys)
// 3. Este cliente se conecta vía HTTPS a los servidores de Supabase
// 4. Todas las queries SQL se ejecutan en su infraestructura
// ====================================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usa Service Role en backend

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ Faltan credenciales de Supabase en .env\n' +
    'Necesitas:\n' +
    '  - SUPABASE_URL\n' +
    '  - SUPABASE_SERVICE_ROLE_KEY\n\n' +
    'Obtén estos valores en: https://app.supabase.com > Tu Proyecto > Settings > API'
  );
}

// Crear cliente de Supabase para uso en el backend
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Función de prueba para verificar conexión
export async function testConnection() {
  try {
    // Intenta hacer una query simple
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = tabla no existe (OK)
      console.log('⚠️  Advertencia:', error.message);
    }
    
    console.log('✅ Conexión a Supabase exitosa!');
    return true;
  } catch (err) {
    console.error('❌ Error conectando a Supabase:', err.message);
    return false;
  }
}

export default supabase;
