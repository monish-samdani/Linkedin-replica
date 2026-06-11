import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../../config/constants.js';

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, default: '' },
  companyLogo: { type: String, default: '' },
});

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true, trim: true },
  degree: { type: String, default: '' },
  field: { type: String, default: '' },
  startYear: { type: String, default: '' },
  endYear: { type: String, default: '' },
  description: { type: String, default: '' },
});

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  endorsements: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: [USER_ROLES.USER, USER_ROLES.ADMIN],
      default: USER_ROLES.USER,
    },
    headline: { type: String, default: '', maxlength: 220 },
    about: { type: String, default: '', maxlength: 2600 },
    location: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    bannerPhoto: { type: String, default: '' },
    website: { type: String, default: '' },
    phone: { type: String, default: '' },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [skillSchema],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    profileViews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ name: 'text', headline: 'text' });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
