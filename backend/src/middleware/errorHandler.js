/**
 * Middleware de manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error completo:', err);
  console.error('❌ Mensaje:', err.message);
  console.error('❌ Código:', err.code);
  console.error('❌ Detalles:', err.details);

  // Error de Supabase
  if (err.code) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details
    });
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: err.message
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;
