import { sendError } from '../utils/apiResponse.js';

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return sendError(res, { message, statusCode });
};

export default errorHandler;
