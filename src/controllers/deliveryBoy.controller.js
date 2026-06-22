import DeliveryBoy from '../models/DeliveryBoy.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import path from 'path';
import { generateOTPEmailTemplate } from '../utils/emailTemplates.js';
import { OrderStatus } from '../constants/index.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ==============================
// ADMIN CONTROLS for Delivery Boy
// ==============================

// @desc    Get all delivery boys
// @route   GET /api/v1/delivery-boys
// @access  Private/Admin
export const getDeliveryBoys = asyncHandler(async (req, res) => {
  const deliveryBoys = await DeliveryBoy.find();
  return new ApiResponse(res).success(deliveryBoys);
});

// @desc    Create a delivery boy
// @route   POST /api/v1/delivery-boys
// @access  Private/Admin
export const createDeliveryBoy = asyncHandler(async (req, res) => {
  const { name, email, phone, password, vehicleType } = req.body;
  const deliveryBoyExists = await DeliveryBoy.findOne({ phone });
  
  if (deliveryBoyExists) {
    res.status(400);
    throw new Error('Delivery boy with this phone already exists');
  }

  const deliveryBoy = await DeliveryBoy.create({
    name, email, phone, password, vehicleType
  });

  return new ApiResponse(res).success(deliveryBoy, 'Delivery boy created successfully', 201);
});

// @desc    Update a delivery boy
// @route   PUT /api/v1/delivery-boys/:id
// @access  Private/Admin
export const updateDeliveryBoy = asyncHandler(async (req, res) => {
  const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
  if (!deliveryBoy) throw new Error('Delivery Boy not found');
  return new ApiResponse(res).success(deliveryBoy, 'Delivery boy updated');
});

// @desc    Delete a delivery boy
// @route   DELETE /api/v1/delivery-boys/:id
// @access  Private/Admin
export const deleteDeliveryBoy = asyncHandler(async (req, res) => {
  const deliveryBoy = await DeliveryBoy.findByIdAndDelete(req.params.id);
  if (!deliveryBoy) throw new Error('Delivery Boy not found');
  return new ApiResponse(res).success({}, 'Delivery boy deleted');
});

// ==============================
// DELIVERY BOY APP CONTROLS
// ==============================

// @desc    Auth delivery boy & get token
// @route   POST /api/v1/delivery-boys/login
// @access  Public
export const loginDeliveryBoy = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const response = new ApiResponse(res);

  const deliveryBoy = await DeliveryBoy.findOne({ email }).select('+password');

  if (!deliveryBoy || !(await deliveryBoy.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!deliveryBoy.active) {
    res.status(401);
    throw new Error('Account is inactive. Contact admin.');
  }

  const token = generateToken(deliveryBoy._id, deliveryBoy.role);

  return response.success({
    _id: deliveryBoy._id,
    name: deliveryBoy.name,
    email: deliveryBoy.email,
    phone: deliveryBoy.phone,
    vehicleType: deliveryBoy.vehicleType,
    role: deliveryBoy.role,
    token
  });
});

// @desc    Get assigned orders for logged in delivery boy
// @route   GET /api/v1/delivery-boys/orders
// @access  Private/DeliveryBoy
export const getAssignedOrders = asyncHandler(async (req, res) => {
  let orders = await Order.find({ 
    assignedDeliveryBoy: req.user._id,
    orderStatus: { $in: [OrderStatus.ASSIGNED, OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.FAILED] }
  }).sort({ createdAt: -1 }).lean();

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  orders = orders.map(order => {
    // Privacy: Mask sensitive data for orders older than 24 hours
    if (new Date(order.createdAt) < twentyFourHoursAgo) {
      if (order.address) {
        order.address.phone = '+91-XXXXX-XXXXX';
        order.address.addressLine1 = 'Hidden for privacy';
        order.address.landmark = 'Hidden';
        // Customer name is intentionally left visible as requested
      }
    }
    return order;
  });

  return new ApiResponse(res).success(orders);
});

// @desc    Update order status
// @route   PUT /api/v1/delivery-boys/orders/:id/status
// @access  Private/DeliveryBoy
export const updateOrderStatusDeliveryBoy = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  
  if (!order) throw new Error('Order not found');
  
  if (order.assignedDeliveryBoy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  const validStatuses = [OrderStatus.ASSIGNED, OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.FAILED];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status update');
  }

  // OTP Validation for Delivery
  if (status === OrderStatus.DELIVERED) {
    const { otp } = req.body;
    if (!order.deliveryOtp) {
      // For older orders that might not have an OTP generated
      console.warn(`Order ${order._id} does not have a deliveryOtp set.`);
    } else if (!otp || otp.trim() !== order.deliveryOtp) {
      res.status(400);
      throw new Error('Invalid Delivery OTP. Please ask the customer for the correct 4-digit code.');
    }
  }

  order.orderStatus = status;
  await order.save();

  return new ApiResponse(res).success(order, `Order marked as ${status}`);
});

// @desc    Get dashboard stats
// @route   GET /api/v1/delivery-boys/dashboard-stats
// @access  Private/DeliveryBoy
export const getDashboardStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const totalAssigned = await Order.countDocuments({ assignedDeliveryBoy: req.user._id });
  const pending = await Order.countDocuments({ 
    assignedDeliveryBoy: req.user._id, 
    orderStatus: { $in: [OrderStatus.ASSIGNED, OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY] } 
  });
  const delivered = await Order.countDocuments({ 
    assignedDeliveryBoy: req.user._id, 
    orderStatus: OrderStatus.DELIVERED 
  });
  const todaysDeliveries = await Order.countDocuments({ 
    assignedDeliveryBoy: req.user._id, 
    orderStatus: OrderStatus.DELIVERED,
    updatedAt: { $gte: startOfToday }
  });

  return new ApiResponse(res).success({ totalAssigned, pending, delivered, todaysDeliveries });
});

// @desc    Get earnings
// @route   GET /api/v1/delivery-boys/earnings
// @access  Private/DeliveryBoy
export const getEarnings = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 
    assignedDeliveryBoy: req.user._id, 
    orderStatus: OrderStatus.DELIVERED 
  });

  const totalEarnings = orders.reduce((acc, curr) => acc + (curr.deliveryCharge || 0), 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const dailyOrders = orders.filter(o => new Date(o.updatedAt) >= startOfToday);
  const dailyEarnings = dailyOrders.reduce((acc, curr) => acc + (curr.deliveryCharge || 0), 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyOrders = orders.filter(o => new Date(o.updatedAt) >= startOfWeek);
  const weeklyEarnings = weeklyOrders.reduce((acc, curr) => acc + (curr.deliveryCharge || 0), 0);

  return new ApiResponse(res).success({ totalEarnings, dailyEarnings, weeklyEarnings });
});

// @desc    Update Profile
// @route   PUT /api/v1/delivery-boys/profile
// @access  Private/DeliveryBoy
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, vehicleType } = req.body;
  const deliveryBoy = await DeliveryBoy.findById(req.user._id);

  if (!deliveryBoy) throw new Error('Delivery Boy not found');

  if (name) deliveryBoy.name = name;
  if (vehicleType) deliveryBoy.vehicleType = vehicleType;
  
  await deliveryBoy.save();

  return new ApiResponse(res).success({
    _id: deliveryBoy._id,
    name: deliveryBoy.name,
    email: deliveryBoy.email,
    phone: deliveryBoy.phone,
    vehicleType: deliveryBoy.vehicleType,
    role: deliveryBoy.role
  }, 'Profile updated successfully');
});

// @desc    Forgot Password
// @route   POST /api/v1/delivery-boys/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const deliveryBoy = await DeliveryBoy.findOne({ email: req.body.email });
  
  if (!deliveryBoy) {
    res.status(404);
    throw new Error('No delivery partner found with that email address');
  }

  // Create 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and set to resetPasswordOtp field
  deliveryBoy.resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');
  // Set expire to 10 minutes
  deliveryBoy.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

  await deliveryBoy.save({ validateBeforeSave: false });

  // Send email
  const message = `Your Delivery Partner Password Reset OTP is: ${otp}\nThis OTP is valid for 10 minutes.`;

  try {
    await sendEmail({
      email: deliveryBoy.email,
      subject: 'Delivery Partner Password Reset OTP',
      message: `Your Delivery Partner Password Reset OTP is: ${otp}\nThis OTP is valid for 10 minutes.`,
      html: generateOTPEmailTemplate(
        'Partner Password Reset',
        `Hi <strong>${deliveryBoy.name}</strong>,<br><br>We received a request to reset your delivery partner app password. Please use the verification code below to proceed:`,
        otp,
        '10 minutes'
      ),
      attachments: [{
        filename: 'logo.jpeg',
        path: path.join(process.cwd(), 'public', 'logo.jpeg'),
        cid: 'logo'
      }]
    });
    return new ApiResponse(res).success({}, 'OTP sent to your registered email');
  } catch (err) {
    deliveryBoy.resetPasswordOtp = undefined;
    deliveryBoy.resetPasswordOtpExpire = undefined;
    await deliveryBoy.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset Password
// @route   POST /api/v1/delivery-boys/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const deliveryBoy = await DeliveryBoy.findOne({
    email,
    resetPasswordOtp,
    resetPasswordOtpExpire: { $gt: Date.now() }
  });

  if (!deliveryBoy) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  deliveryBoy.password = newPassword;
  deliveryBoy.resetPasswordOtp = undefined;
  deliveryBoy.resetPasswordOtpExpire = undefined;

  await deliveryBoy.save();

  return new ApiResponse(res).success({}, 'Password reset successful');
});

// @desc    Change Password
// @route   POST /api/v1/delivery-boys/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const deliveryBoy = await DeliveryBoy.findById(req.user.id).select('+password');

  if (!deliveryBoy) {
    res.status(404);
    throw new Error('Delivery boy not found');
  }

  // Check current password
  if (!(await deliveryBoy.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Incorrect current password');
  }

  deliveryBoy.password = newPassword;
  await deliveryBoy.save();

  return new ApiResponse(res).success({}, 'Password changed successfully');
});
