import express from 'express';
import {
  getDeliveryBoys, createDeliveryBoy, updateDeliveryBoy, deleteDeliveryBoy,
  loginDeliveryBoy, getAssignedOrders, updateOrderStatusDeliveryBoy, forgotPassword, resetPassword, changePassword, getDashboardStats, getEarnings, updateProfile
} from '../controllers/deliveryBoy.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { Roles } from '../constants/index.js';

const router = express.Router();

const adminOnly = [protect, authorize(Roles.ADMIN)];
const dboyOnly = [protect, authorize(Roles.DELIVERY_BOY)];
  
// Admin Controls
router.route('/')
  .get(adminOnly, getDeliveryBoys)
  .post(adminOnly, createDeliveryBoy);
router.route('/:id')
  .put(adminOnly, updateDeliveryBoy)
  .delete(adminOnly, deleteDeliveryBoy);

// Delivery Boy App Controls
router.post('/login', loginDeliveryBoy);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', dboyOnly, changePassword);
router.put('/profile', dboyOnly, updateProfile);

router.get('/dashboard-stats', dboyOnly, getDashboardStats);
router.get('/earnings', dboyOnly, getEarnings);

router.get('/orders', dboyOnly, getAssignedOrders);
router.put('/orders/:id/status', dboyOnly, updateOrderStatusDeliveryBoy);

export default router;
