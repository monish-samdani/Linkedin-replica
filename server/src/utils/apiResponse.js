export const sendSuccess = (res, { message = 'Success', data = null, statusCode = 200 } = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    statusCode,
  });
};

export const sendError = (res, { message = 'Error', statusCode = 500, data = null } = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
    statusCode,
  });
};
