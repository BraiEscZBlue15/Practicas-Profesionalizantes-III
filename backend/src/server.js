import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './config/supabase.js';
import exampleRoutes from './routes/exampleRoutes.js';
import rolesRoutes from './routes/rolesRoutes.js';
import institucionesRoutes from './routes/institucionesRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import documentosRoutes from './routes/documentosRoutes.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ====================================================================
// MIDDLEWARES
// ====================================================================

// Helmet: Seguridad HTTP headers
app.use(helmet());

// CORS: Permitir peticiones desde el frontend y ngrok
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    /\.ngrok-free\.app$/,  // Permitir cualquier subdominio de ngrok
    /\.ngrok\.io$/
  ].filter(Boolean),
  credentials: true
}));

// Body parser: Leer JSON en peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan: Logger de peticiones HTTP
app.use(morgan('dev'));

// ====================================================================
// RUTAS
// ====================================================================

// Ruta de salud (health check)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api/items', exampleRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/instituciones', institucionesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/documentos', documentosRoutes);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// ====================================================================
// MANEJO DE ERRORES GLOBAL
// ====================================================================
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ====================================================================
// INICIAR SERVIDOR
// ====================================================================
async function startServer() {
  try {
    // Probar conexión a Supabase
    console.log('🔄 Probando conexión a Supabase...');
    await testConnection();

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log('');
      console.log('====================================');
      console.log('🚀 Servidor iniciado exitosamente');
      console.log('====================================');
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log('====================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
