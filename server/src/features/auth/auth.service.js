import jwt from 'jsonwebtoken';
import User from './auth.model.js';
import AppError from '../../utils/AppError.js';
import { uploadToCloudinary } from '../../config/cloudinary.js';

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
