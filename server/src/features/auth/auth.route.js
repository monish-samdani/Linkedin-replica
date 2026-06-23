import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import upload from '../../middleware/upload.js';
import { protect } from './auth.middleware.js';
import {
  registerController,
  loginController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  validateResetTokenController,
  getMeController,
  updateProfileController,
  deleteAccountController,
  addExperienceController,
  updateExperienceController,
  deleteExperienceController,
  addEducationController,
  updateEducationController,
  deleteEducationController,
  updateSkillsController,
  uploadProfilePhotoController,
  uploadBannerPhotoController,
} from './auth.controller.js';

const router = Router();

const registerValidation = [
  body('name').notEmpty().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must have uppercase, lowercase and a number'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const forgotPasswordValidation = [body('email').isEmail().normalizeEmail()];

const resetPasswordValidation = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

router.post('/register', authLimiter, registerValidation, validate, registerController);
router.post('/login', authLimiter, loginValidation, validate, loginController);
router.post('/logout', protect, logoutController);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, validate, forgotPasswordController);
router.post('/reset-password/:token', authLimiter, resetPasswordValidation, validate, resetPasswordController);
router.get('/reset-password/:token/validate', validateResetTokenController);
router.get('/me', protect, getMeController);
router.put('/me', protect, updateProfileController);
router.delete('/me', protect, deleteAccountController);
router.post('/me/experience', protect, addExperienceController);
router.put('/me/experience/:id', protect, updateExperienceController);
router.delete('/me/experience/:id', protect, deleteExperienceController);
router.post('/me/education', protect, addEducationController);
router.put('/me/education/:id', protect, updateEducationController);
router.delete('/me/education/:id', protect, deleteEducationController);
router.put('/me/skills', protect, updateSkillsController);
router.post('/me/photo/profile', protect, upload.single('photo'), uploadProfilePhotoController);
router.post('/me/photo/banner', protect, upload.single('photo'), uploadBannerPhotoController);

export default router;
