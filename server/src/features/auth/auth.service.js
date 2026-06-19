import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from './auth.model.js';
import AppError from '../../utils/AppError.js';
import { uploadToCloudinary } from '../../config/cloudinary.js';
import { sendEmail } from '../../config/mailer.js';

const hashResetToken = (rawToken) => crypto.createHash('sha256').update(rawToken).digest('hex');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409);

  const user = await User.create({ name, email, password });
  const { accessToken } = generateTokens(user._id);

  return { user: user.toPublicJSON(), accessToken };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  return { user: user.toPublicJSON(), accessToken: generateTokens(user._id).accessToken };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user.toPublicJSON();
};

const ALLOWED_PROFILE_FIELDS = ['name', 'headline', 'about', 'location', 'website', 'phone'];

export const updateProfile = async (userId, updateData) => {
  const filtered = {};
  ALLOWED_PROFILE_FIELDS.forEach((field) => {
    if (updateData[field] !== undefined) filtered[field] = updateData[field];
  });

  const user = await User.findByIdAndUpdate(userId, filtered, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  return user.toPublicJSON();
};

export const addExperience = async (userId, expData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  user.experience.push(expData);
  await user.save();
  return user.toPublicJSON();
};

export const updateExperience = async (userId, expId, expData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const exp = user.experience.id(expId);
  if (!exp) throw new AppError('Experience not found', 404);

  Object.keys(expData).forEach((key) => {
    if (expData[key] !== undefined) exp[key] = expData[key];
  });

  await user.save();
  return user.toPublicJSON();
};

export const deleteExperience = async (userId, expId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const exp = user.experience.id(expId);
  if (!exp) throw new AppError('Experience not found', 404);

  exp.deleteOne();
  await user.save();
  return user.toPublicJSON();
};

export const addEducation = async (userId, eduData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  user.education.push(eduData);
  await user.save();
  return user.toPublicJSON();
};

export const updateEducation = async (userId, eduId, eduData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const edu = user.education.id(eduId);
  if (!edu) throw new AppError('Education not found', 404);

  Object.keys(eduData).forEach((key) => {
    if (eduData[key] !== undefined) edu[key] = eduData[key];
  });

  await user.save();
  return user.toPublicJSON();
};

export const deleteEducation = async (userId, eduId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const edu = user.education.id(eduId);
  if (!edu) throw new AppError('Education not found', 404);

  edu.deleteOne();
  await user.save();
  return user.toPublicJSON();
};

export const updateSkills = async (userId, skills) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  user.skills = skills;
  await user.save();
  return user.toPublicJSON();
};

export const uploadProfilePhoto = async (userId, buffer, options = {}) => {
  const result = await uploadToCloudinary(buffer, {
    folder: 'linkedin-replica/profiles',
    ...options,
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { profilePhoto: result.secure_url },
    { new: true }
  );
  if (!user) throw new AppError('User not found', 404);
  return user.toPublicJSON();
};

export const uploadBannerPhoto = async (userId, buffer, options = {}) => {
  const result = await uploadToCloudinary(buffer, {
    folder: 'linkedin-replica/banners',
    ...options,
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { bannerPhoto: result.secure_url },
    { new: true }
  );
  if (!user) throw new AppError('User not found', 404);
  return user.toPublicJSON();
};

export const findUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user.toPublicJSON();
};

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  // Do not reveal whether the email exists.
  if (!user) return { sent: false };

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = hashResetToken(rawToken);
  user.resetPasswordExpires = Date.now() + RESET_TOKEN_TTL_MS;
  await user.save({ validateBeforeSave: false });

  const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/reset-password/${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Unlinked password',
      text: `You requested a password reset. Use the link below within 15 minutes to set a new password:\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0a66c2;">Reset your password</h2>
          <p>You requested a password reset for your Unlinked account. Click the button below to set a new password. This link expires in 15 minutes.</p>
          <p style="margin: 24px 0;">
            <a href="${resetUrl}" style="background:#0a66c2;color:#fff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:600;">Reset password</a>
          </p>
          <p style="color:#666;font-size:13px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color:#0a66c2;font-size:13px;word-break:break-all;">${resetUrl}</p>
          <p style="color:#666;font-size:13px;">If you did not request this, you can safely ignore this email.</p>
        </div>`,
    });
  } catch {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Failed to send reset email. Please try again later.', 500);
  }

  return { sent: true };
};

export const resetPassword = async (rawToken, password) => {
  const user = await User.findOne({
    resetPasswordToken: hashResetToken(rawToken),
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) throw new AppError('Token is invalid or has expired', 400);

  // Assign the plain password and let the model's pre-save hook hash it,
  // so we don't double-hash and break login.
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { email: user.email };
};

export const validateResetToken = async (rawToken) => {
  const user = await User.findOne({
    resetPasswordToken: hashResetToken(rawToken),
    resetPasswordExpires: { $gt: Date.now() },
  });

  return { valid: Boolean(user) };
};
