import express from 'express';
import { initiateSignup, verifySignupOtp, loginUser, getMe, forgotPassword, resetPassword } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'User API is running' });
})
router.post('/signup', initiateSignup);
router.post('/verify-otp', verifySignupOtp);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
