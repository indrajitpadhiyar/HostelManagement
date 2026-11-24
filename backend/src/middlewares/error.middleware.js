import ApiError from '../utils/apiError.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = ApiError.notFound(message);
  }

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = ApiError.conflict(message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message);
    const message = `Validation failed: ${errors.join(', ')}`;
    error = ApiError.badRequest(message, errors);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error Handler] ${req.method} ${req.url} -> ${error.statusCode} ${error.message}`);
  }

  res.status(error.statusCode).json(response);
};

export default errorHandler;
