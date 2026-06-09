import express from 'express';
import {
  createOrder, verifyPayment, getOrderById, getOrders, updateOrderStatus, assignDeliveryBoy, getMyOrders, deleteOrder
} from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createOrderValidation } from '../validations/order.validation.js';
import { Roles } from '../constants/index.js';

const router = express.Router();

// Public / Guest Routes
router.post('/', createOrderValidation, validateRequest, createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', getOrderById);
router.delete('/:id/cancel', protect, deleteOrder);

// Admin Routes
const adminOnly = [protect, authorize(Roles.ADMIN)];
router.get('/', adminOnly, getOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);
router.put('/:id/assign', adminOnly, assignDeliveryBoy);

export default router;
