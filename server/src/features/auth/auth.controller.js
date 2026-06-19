import asyncHandler from '../../utils/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  updateSkills,
  uploadProfilePhoto,
  uploadBannerPhoto,
  requestPasswordReset,
  resetPassword,
  validateResetToken,
} from './auth.service.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const registerController = asyncHandler(async (req, res) => {
  const { user, accessToken } = await registerUser(req.body);
  res.cookie('accessToken', accessToken, cookieOptions);
  return sendSuccess(res, { message: 'Registration successful', data: { user }, statusCode: 201 });
});

export const loginController = asyncHandler(async (req, res) => {
  const { user, accessToken } = await loginUser(req.body);
  res.cookie('accessToken', accessToken, cookieOptions);
  return sendSuccess(res, { message: 'Login successful', data: { user } });
});

export const logoutController = asyncHandler(async (req, res) => {
  res.clearCookie('accessToken', cookieOptions);
  return sendSuccess(res, { message: 'Logged out successfully' });
});

export const forgotPasswordController = asyncHandler(async (req, res) => {
  await requestPasswordReset(req.body.email);
  return sendSuccess(res, {
    message: "If an account with that email exists, you'll receive a reset link shortly.",
  });
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  await resetPassword(req.params.token, req.body.password);
  return sendSuccess(res, { message: 'Password reset successful. Please sign in.' });
});

export const validateResetTokenController = asyncHandler(async (req, res) => {
  const result = await validateResetToken(req.params.token);
  return sendSuccess(res, { message: 'Reset token validation', data: result });
});

export const getMeController = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user._id);
  return sendSuccess(res, { message: 'User fetched', data: { user } });
});

export const updateProfileController = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user._id, req.body);
  return sendSuccess(res, { message: 'Profile updated', data: { user } });
});

export const addExperienceController = asyncHandler(async (req, res) => {
  const user = await addExperience(req.user._id, req.body);
  return sendSuccess(res, { message: 'Experience added', data: { user } });
});

export const updateExperienceController = asyncHandler(async (req, res) => {
  const user = await updateExperience(req.user._id, req.params.id, req.body);
  return sendSuccess(res, { message: 'Experience updated', data: { user } });
});

export const deleteExperienceController = asyncHandler(async (req, res) => {
  const user = await deleteExperience(req.user._id, req.params.id);
  return sendSuccess(res, { message: 'Experience deleted', data: { user } });
});

export const addEducationController = asyncHandler(async (req, res) => {
  const user = await addEducation(req.user._id, req.body);
  return sendSuccess(res, { message: 'Education added', data: { user } });
});

export const updateEducationController = asyncHandler(async (req, res) => {
  const user = await updateEducation(req.user._id, req.params.id, req.body);
  return sendSuccess(res, { message: 'Education updated', data: { user } });
});

export const deleteEducationController = asyncHandler(async (req, res) => {
  const user = await deleteEducation(req.user._id, req.params.id);
  return sendSuccess(res, { message: 'Education deleted', data: { user } });
});

export const updateSkillsController = asyncHandler(async (req, res) => {
  const user = await updateSkills(req.user._id, req.body.skills);
  return sendSuccess(res, { message: 'Skills updated', data: { user } });
});

export const uploadProfilePhotoController = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const user = await uploadProfilePhoto(req.user._id, req.file.buffer);
  return sendSuccess(res, { message: 'Profile photo uploaded', data: { user } });
});

export const uploadBannerPhotoController = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const user = await uploadBannerPhoto(req.user._id, req.file.buffer);
  return sendSuccess(res, { message: 'Banner photo uploaded', data: { user } });
});
