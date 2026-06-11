import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import SignupOtp from "../models/SignupOtp.js";
import ApiResponse from "../utils/apiResponse.js";
import sendEmail from "../utils/sendEmail.js";
import path from "path";
import {
  generateOTPEmailTemplate,
  generateWelcomeEmailTemplate,
} from "../utils/emailTemplates.js";
// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/v1/users/register
// @access  Public
// @desc    Initiate sign‑up (send OTP)
// @route   POST /api/v1/auth/signup
// @access  Public
// export const initiateSignup = asyncHandler(async (req, res) => {
//   console.log("Body", req.body);
//   console.log("signup initiated");
//   const { name, email, password, phone } = req.body;

//   if (!name || !email || !password || !phone) {
//     res.status(400);
//     throw new Error("Please add all fields");
//   }

//   if (phone.length !== 10 || !/^\d+$/.test(phone)) {
//     res.status(400);
//     throw new Error("Phone number must be exactly 10 digits");
//   }

//   // Check if user already exists
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     res.status(400);
//     throw new Error("User already exists with this email");
//   }

//   // Generate 6‑digit OTP
//   const otp = crypto.randomInt(100000, 999999).toString();
//   const expiresAt = new Date(Date.now() + 60 * 1000); // 60 sec

//   // Upsert OTP document (in case of resend)
//   await SignupOtp.findOneAndUpdate(
//     { email },
//     { otp, expiresAt },
//     { upsert: true, returnDocument: "after" },
//   );
//   console.log('otp', otp);
//   console.log('expiresAt', expiresAt);
//   // Send OTP email
//   await sendEmail({
//     email,
//     subject: "Your OTP for Lalbaug Roti House Sign-up",
//     message: `Your OTP is ${otp}. It will expire in 60 seconds.`,
//     html: generateOTPEmailTemplate(
//       "Verify Your Email Address",
//       `Hi <strong>${name}</strong>,<br><br>Thank you for starting your sign-up process with Lalbaug Roti House. To complete your registration and secure your account, please use the verification code below:`,
//       otp,
//       "60 seconds",
//     ),
//   });

//   // Temporarily store the user data in the OTP document (optional) – for simplicity we will store it in memory via a JWT later.
//   // Here we just respond that OTP was sent.
//   res.status(200).json({ success: true, message: "OTP sent to email" });
// });
export const initiateSignup = asyncHandler(async (req, res) => {
  const requestId = `signup-${Date.now()}`;

  try {
    console.log(`\n========== ${requestId} START ==========`);

    console.log(`[${requestId}] Request received`);
    console.log(`[${requestId}] Method:`, req.method);
    console.log(`[${requestId}] URL:`, req.originalUrl);
    console.log(`[${requestId}] Headers:`, req.headers);

    console.log(`[${requestId}] Body:`, JSON.stringify(req.body, null, 2));

    const { name, email, password, phone } = req.body;

    console.log(`[${requestId}] Extracted fields`);
    console.log(`[${requestId}] name:`, name);
    console.log(`[${requestId}] email:`, email);
    console.log(`[${requestId}] password exists:`, !!password);
    console.log(`[${requestId}] phone:`, phone);

    // ===========================
    // Validation
    // ===========================
    console.log(`[${requestId}] Starting validation`);

    if (!name || !email || !password || !phone) {
      console.error(`[${requestId}] Validation failed - missing fields`);

      res.status(400);
      throw new Error("Please add all fields");
    }

    console.log(`[${requestId}] Required fields validated`);

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      console.error(`[${requestId}] Phone validation failed`);

      res.status(400);
      throw new Error("Phone number must be exactly 10 digits");
    }

    console.log(`[${requestId}] Phone validation passed`);

    // ===========================
    // User lookup
    // ===========================
    console.log(`[${requestId}] Checking if user exists`);

    const existingUser = await User.findOne({ email });

    console.log(`[${requestId}] User lookup completed`);

    if (existingUser) {
      console.error(`[${requestId}] User already exists`);

      res.status(400);
      throw new Error("User already exists with this email");
    }

    console.log(`[${requestId}] User does not exist`);

    // ===========================
    // OTP generation
    // ===========================
    console.log(`[${requestId}] Generating OTP`);

    const otp = crypto.randomInt(100000, 999999).toString();

    const expiresAt = new Date(Date.now() + 60 * 1000);

    console.log(`[${requestId}] OTP generated:`, otp);

    console.log(`[${requestId}] OTP expires at:`, expiresAt.toISOString());

    // ===========================
    // OTP save
    // ===========================
    console.log(`[${requestId}] Saving OTP to database`);

    const otpDoc = await SignupOtp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    console.log(`[${requestId}] OTP saved successfully`);

    console.log(`[${requestId}] OTP document:`, otpDoc);

    // ===========================
    // Email diagnostics
    // ===========================
    console.log(`[${requestId}] Email service diagnostics`);

    console.log(`[${requestId}] SMTP_HOST exists:`, !!process.env.SMTP_HOST);

    console.log(`[${requestId}] SMTP_PORT exists:`, !!process.env.SMTP_PORT);

    console.log(`[${requestId}] SMTP_EMAIL exists:`, !!process.env.SMTP_EMAIL);

    console.log(
      `[${requestId}] SMTP_PASSWORD exists:`,
      !!process.env.SMTP_PASSWORD,
    );

    console.log(`[${requestId}] NODE_ENV:`, process.env.NODE_ENV);

    // ===========================
    // Send email
    // ===========================
    console.log(`[${requestId}] Preparing email payload`);

    const emailPayload = {
      email,
      subject: "Your OTP for Lalbaug Roti House Sign-up",
      message: `Your OTP is ${otp}. It will expire in 60 seconds.`,
      html: generateOTPEmailTemplate(
        "Verify Your Email Address",
        `Hi <strong>${name}</strong>,<br><br>Thank you for starting your sign-up process with Lalbaug Roti House. To complete your registration and secure your account, please use the verification code below:`,
        otp,
        "60 seconds",
      ),
    };

    console.log(`[${requestId}] About to call sendEmail()`);

    const emailStart = Date.now();

    await sendEmail(emailPayload);

    const emailEnd = Date.now();

    console.log(`[${requestId}] sendEmail() completed successfully`);

    console.log(`[${requestId}] Email duration: ${emailEnd - emailStart} ms`);

    // ===========================
    // Response
    // ===========================
    console.log(`[${requestId}] Sending success response`);

    res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });

    console.log(`[${requestId}] Response sent successfully`);

    console.log(`========== ${requestId} END ==========\n`);
  } catch (error) {
    console.error(`========== ${requestId} ERROR ==========`);

    console.error(`[${requestId}] Error message:`, error.message);

    console.error(`[${requestId}] Error stack:`, error.stack);

    console.error(`========== ${requestId} ERROR END ==========`);

    throw error;
  }
});
// @desc    Verify OTP and create user
// @route   POST /api/v1/auth/verify-otp
// @access  Public
export const verifySignupOtp = asyncHandler(async (req, res) => {
  const { email, otp, name, password, phone } = req.body;

  if (!email || !otp || !name || !password || !phone) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const otpDoc = await SignupOtp.findOne({ email, otp });
  if (!otpDoc) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  if (otpDoc.expiresAt < new Date()) {
    await SignupOtp.deleteOne({ _id: otpDoc._id });
    res.status(400);
    throw new Error("OTP has expired");
  }

  // OTP valid – create user
  const user = await User.create({ name, email, password, phone });
  await SignupOtp.deleteOne({ _id: otpDoc._id });

  // Send Welcome Email
  try {
    await sendEmail({
      email,
      subject: "Welcome to Lalbaug Roti House! 🎉",
      message: `Hi ${name},\n\nYour account has been successfully created. We are absolutely thrilled to have you with us!\n\nGet ready to experience the authentic taste of fresh, handmade rotis delivered straight to your door. You can now log in, save your addresses, track past orders, and enjoy lightning-fast checkouts.\n\nBon appétit!`,
      html: generateWelcomeEmailTemplate(name),
    });
  } catch (emailError) {
    console.error("Failed to send welcome email:", emailError);
    // Continue anyway since user is successfully created
  }

  res.status(201).json({
    success: true,
    data: {
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id, user.role),
    },
    message: "Account created successfully",
  });
});

// @desc    Authenticate a user
// @route   POST /api/v1/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id, user.role),
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Get user data
// @route   GET /api/v1/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Forgot Password
// @route   POST /api/v1/users/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error("No user found with that email");
  }

  // Create 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and set to resetPasswordOtp field
  user.resetPasswordOtp = crypto.createHash("sha256").update(otp).digest("hex");
  // Set expire to 10 minutes
  user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  // Send email
  const message = `Your Password Reset OTP is: ${otp}\nThis OTP is valid for 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP",
      message: `Your Password Reset OTP is: ${otp}\nThis OTP is valid for 10 minutes.`,
      html: generateOTPEmailTemplate(
        "Reset Your Password",
        `Hi <strong>${user.name || "User"}</strong>,<br><br>We received a request to reset your password for your Lalbaug Roti House account. Please use the verification code below to proceed:`,
        otp,
        "10 minutes",
      ),
    });
    return new ApiResponse(res).success({}, "OTP sent to email");
  } catch (err) {
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error("Email could not be sent");
  }
});

// @desc    Reset Password
// @route   POST /api/v1/users/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const resetPasswordOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const user = await User.findOne({
    email,
    resetPasswordOtp,
    resetPasswordOtpExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  user.password = newPassword;
  user.resetPasswordOtp = undefined;
  user.resetPasswordOtpExpire = undefined;

  await user.save();

  return new ApiResponse(res).success({}, "Password reset successful");
});
