import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    return sendError(res, { message, statusCode: 400 });
  }
  next();
};

export default validate;
