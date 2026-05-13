export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500 || process.env.NODE_ENV !== 'production') {
    console.error(error);
  }

  res.status(statusCode).json({
    message: error.message || 'Internal server error',
    details: error.details || undefined
  });
}
