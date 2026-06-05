import Admin from '../models/Admin.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import path from 'path';
import { generateOTPEmailTemplate } from '../utils/emailTemplates.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Auth admin & get token
// @route   POST /api/v1/admin/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const response = new ApiResponse(res);

  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
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

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const response = new ApiResponse(res);

  const totalOrders = await Order.countDocuments();
  
  // Today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysOrders = await Order.countDocuments({ createdAt: { $gte: today } });

  // Revenue (total of DELIVERED orders)
  const revenueData = await Order.aggregate([
    { $match: { orderStatus: 'DELIVERED' } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
  ]);
  const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  const pendingOrders = await Order.countDocuments({ orderStatus: 'PENDING' });
  const deliveredOrders = await Order.countDocuments({ orderStatus: 'DELIVERED' });

  return response.success({
    totalOrders,
    todaysOrders,
    revenue,
    pendingOrders,
    deliveredOrders
  });
});

// @desc    Forgot Password
// @route   POST /api/v1/admin/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });
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

  // Send email
  const message = `Your Lalbaug Roti House Admin Password Reset OTP is: ${otp}\nThis OTP is valid for 10 minutes.`;

  try {
    await sendEmail({
      email: admin.email,
      subject: 'Admin Password Reset OTP',
      message: `Your Admin Password Reset OTP is: ${otp}\nThis OTP is valid for 10 minutes.`,
      html: generateOTPEmailTemplate(
        'Admin Password Reset',
        'Hi <strong>Admin</strong>,<br><br>We received a request to reset your admin portal password. Please use the verification code below to proceed:',
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
// @route   POST /api/v1/admin/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const admin = await Admin.findOne({
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
