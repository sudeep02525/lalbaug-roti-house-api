import CmsAdmin from '../models/CmsAdmin.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import path from 'path';
import { generateOTPEmailTemplate } from '../utils/emailTemplates.js';
import { Roles } from '../constants/index.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Auth CMS Admin & get token
// @route   POST /api/v1/cms/login
// @access  Public
export const loginCms = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const response = new ApiResponse(res);

  const admin = await CmsAdmin.findOne({ email }).select('+password');

  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Ensure only CMS_ADMIN can log into the CMS
  if (admin.role !== Roles.CMS_ADMIN) {
    res.status(403);
    throw new Error('Access denied. You do not have permission to access the CMS.');
  }

  const token = generateToken(admin._id, admin.role);

  return response.success({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    token
  });
});

// @desc    Forgot Password
// @route   POST /api/v1/cms/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const admin = await CmsAdmin.findOne({ email: req.body.email });
  if (!admin) {
    res.status(404);
    throw new Error('No user found with that email');
  }

  // Create 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and set to resetPasswordOtp field
  admin.resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');
  // Set expire to 10 minutes
  admin.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

  await admin.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: admin.email,
      subject: 'CMS Password Reset OTP',
      message: `Your CMS Password Reset OTP is: ${otp}\nThis OTP is valid for 10 minutes.`,
      html: generateOTPEmailTemplate(
        'CMS Password Reset',
        'Hi <strong>Manager</strong>,<br><br>We received a request to reset your CMS portal password. Please use the verification code below to proceed:',
        otp,
        '10 minutes'
      ),
      attachments: [{
        filename: 'logo.jpeg',
        path: path.join(process.cwd(), 'public', 'logo.jpeg'),
        cid: 'logo'
      }]
    });
    return new ApiResponse(res).success({}, 'OTP sent to email');
  } catch (err) {
    admin.resetPasswordOtp = undefined;
    admin.resetPasswordOtpExpire = undefined;
    await admin.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset Password
// @route   POST /api/v1/cms/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const admin = await CmsAdmin.findOne({
    email,
    resetPasswordOtp,
    resetPasswordOtpExpire: { $gt: Date.now() }
  });

  if (!admin) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  admin.password = newPassword;
  admin.resetPasswordOtp = undefined;
  admin.resetPasswordOtpExpire = undefined;

  await admin.save();

  return new ApiResponse(res).success({}, 'Password reset successful');
});

// @desc    Update CMS profile (name)
// @route   PUT /api/v1/cms/profile
// @access  Private/CMS_ADMIN
export const updateCmsProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const admin = await CmsAdmin.findById(req.user.id);

  if (!admin) {
    res.status(404);
    throw new Error('User not found');
  }

  admin.name = name || admin.name;
  await admin.save();

  return new ApiResponse(res).success({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  }, 'Profile updated successfully');
});

// @desc    Update CMS password
// @route   PUT /api/v1/cms/password
// @access  Private/CMS_ADMIN
export const updateCmsPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Find admin with password
  const admin = await CmsAdmin.findById(req.user.id).select('+password');

  if (!admin) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check current password
  if (!(await admin.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Incorrect current password');
  }

  // Set new password (will be hashed by model pre-save hook)
  admin.password = newPassword;
  await admin.save();

  return new ApiResponse(res).success({}, 'Password updated successfully');
});

// ==============================
// SUPER ADMIN CONTROLS FOR CMS ADMINS
// ==============================

// @desc    Get all CMS Admins
// @route   GET /api/v1/cms/manage
// @access  Private/Admin
export const getCmsAdmins = asyncHandler(async (req, res) => {
  const admins = await CmsAdmin.find().select('-password');
  return new ApiResponse(res).success(admins);
});

// @desc    Create a CMS Admin
// @route   POST /api/v1/cms/manage
// @access  Private/Admin
export const createCmsAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  const adminExists = await CmsAdmin.findOne({ email });
  if (adminExists) {
    res.status(400);
    throw new Error('CMS Admin with this email already exists');
  }

  const admin = await CmsAdmin.create({
    name,
    email,
    password,
    role: Roles.CMS_ADMIN,
    active: true
  });

  return new ApiResponse(res).success({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role
  }, 'CMS Admin created successfully', 201);
});

// @desc    Update a CMS Admin
// @route   PUT /api/v1/cms/manage/:id
// @access  Private/Admin
export const updateCmsAdmin = asyncHandler(async (req, res) => {
  const { name, email, active, password } = req.body;
  
  const admin = await CmsAdmin.findById(req.params.id);
  if (!admin) {
    res.status(404);
    throw new Error('CMS Admin not found');
  }

  if (name) admin.name = name;
  if (email) admin.email = email;
  if (active !== undefined) admin.active = active;
  if (password) admin.password = password;

  await admin.save();

  return new ApiResponse(res).success({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    active: admin.active
  }, 'CMS Admin updated successfully');
});

// @desc    Delete a CMS Admin
// @route   DELETE /api/v1/cms/manage/:id
// @access  Private/Admin
export const deleteCmsAdmin = asyncHandler(async (req, res) => {
  const admin = await CmsAdmin.findByIdAndDelete(req.params.id);
  if (!admin) {
    res.status(404);
    throw new Error('CMS Admin not found');
  }

  return new ApiResponse(res).success({}, 'CMS Admin deleted successfully');
});
