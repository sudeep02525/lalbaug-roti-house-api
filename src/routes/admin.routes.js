import express from 'express';
import { loginAdmin, getDashboardStats, forgotPassword, resetPassword, updateAdminProfile, updateAdminPassword } from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { adminLoginValidation } from '../validations/admin.validation.js';
import { Roles } from '../constants/index.js';

const router = express.Router();

router.post('/login', adminLoginValidation, validateRequest, loginAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/dashboard', protect, authorize(Roles.ADMIN), getDashboardStats);
router.put('/profile', protect, authorize(Roles.ADMIN), updateAdminProfile);
router.put('/password', protect, authorize(Roles.ADMIN), updateAdminPassword);

export default router;
