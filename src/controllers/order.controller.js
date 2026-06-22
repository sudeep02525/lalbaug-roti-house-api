import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import DeliveryBoy from '../models/DeliveryBoy.js';
import DeliveryService from '../services/delivery.service.js';
import RazorpayService from '../services/razorpay.service.js';
import Settings from '../models/Settings.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import { getIO } from '../socket.js';
import { OrderStatus, PaymentStatus, DeliverySettings } from '../constants/index.js';
import PushService from '../services/push.service.js';

// Assume the restaurant's coordinates are fixed for this example
const RESTAURANT_LAT = 18.9690;
const RESTAURANT_LON = 72.8311;

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Public (Guest Checkout)
export const createOrder = asyncHandler(async (req, res) => {
  const { items, address, notes, paymentMethod } = req.body;
  const response = new ApiResponse(res);

  // 0. Check Operating Hours
  const settings = await Settings.findOne();
  if (settings) {
    if (settings.isAcceptingOrders === false) {
      res.status(400);
      throw new Error('We are currently not accepting orders.');
    }

    const now = new Date();
    // Convert to IST
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hours = istTime.getUTCHours().toString().padStart(2, '0');
    const minutes = istTime.getUTCMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    if (currentTime < settings.serviceStartTime || currentTime > settings.serviceEndTime) {
      res.status(400);
      throw new Error(`Store is closed. Operating hours are ${settings.serviceStartTime} to ${settings.serviceEndTime} IST.`);
    }
  }

  // 1. Calculate Distance
  const distance = DeliveryService.getDistance(
    RESTAURANT_LAT, RESTAURANT_LON,
    address.latitude, address.longitude
  );

  // Will throw error if beyond max radius
  const deliveryCharge = DeliveryService.calculateDeliveryCharge(distance);

  // 2. Validate Items and Calculate Subtotal
  let subtotal = 0;
  let totalRotiQuantity = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);

    let variant;
    if (!item.variantId || item.variantId === 'base' || item.variantId === 'pack') {
      const minQty = item.variantId === 'pack' ? 5 : 1;
      variant = await Variant.findOne({ productId: product._id, minQuantity: { $gte: minQty } });
      if (variant) item.variantId = variant._id.toString();
    } else {
      variant = await Variant.findById(item.variantId);
    }
    
    if (!variant) throw new Error(`Variant ${item.variantId} not found`);

    // Removed broken variant minQuantity check which failed on packs

    // Checking if it's a roti and summing quantity for total order validation
    if (product.name.toLowerCase().includes('roti')) {
       // if the variant is "Pack of 5", it's 5 rotis. We just use quantity for now assuming 1 quantity = 1 roti if single, 
       // or we just use global minimum order quantity.
       totalRotiQuantity += item.quantity; 
    }

    const itemTotal = variant.price * item.quantity;
    subtotal += itemTotal;

    processedItems.push({
      productId: product._id,
      variantId: variant._id,
      name: `${product.name} (${variant.name})`,
      price: variant.price,
      quantity: item.quantity,
      addons: item.addons || []
    });
  }

  // Minimum order check removed as per user request

  const totalAmount = subtotal + deliveryCharge;

  // 3. Create Order in DB
  const orderNumber = 'LRH' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  
  const order = await Order.create({
    orderNumber,
    items: processedItems,
    subtotal,
    deliveryCharge,
    totalAmount,
    deliveryDistance: distance,
    address,
    notes,
    deliveryOtp
  });

  // 4. Create Razorpay Order if online
  let razorpayOrderId = null;
  let amount = totalAmount * 100;
  let currency = 'INR';

  if (paymentMethod !== 'cod') {
    try {
      const razorpayOrder = await RazorpayService.createOrder(totalAmount, order._id.toString());
      razorpayOrderId = razorpayOrder.id;
      amount = razorpayOrder.amount;
      currency = razorpayOrder.currency;
      
      order.razorpayOrderId = razorpayOrderId;
      await order.save();
    } catch (error) {
      console.error('Razorpay Error:', error);
      throw new Error('Failed to create payment order with Razorpay. Please check API keys.');
    }
  } else {
    order.orderStatus = OrderStatus.CONFIRMED;
    await order.save();
    
    // Emit notification for COD order
    try {
      getIO().emit('new_order', { orderId: order._id, orderNumber: order.orderNumber, amount: order.totalAmount, type: 'COD' });
      PushService.notifyAllAdmins('New Order Received', `Order #${order.orderNumber} for ₹${order.totalAmount} (COD)`);
    } catch (err) {
      console.log('Socket.io error:', err.message);
    }
  }

  return response.success({
    order,
    razorpayOrderId,
    amount,
    currency,
    keyId: process.env.RAZORPAY_KEY_ID
  }, 'Order created successfully', 201);
});

// @desc    Verify Razorpay Payment
// @route   POST /api/v1/orders/verify-payment
// @access  Public
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const response = new ApiResponse(res);

  const isValid = RazorpayService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  
  if (!isValid) {
    throw new Error('Invalid payment signature');
  }

  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  if (!order) throw new Error('Order not found');

  order.paymentStatus = PaymentStatus.PAID;
  order.razorpayPaymentId = razorpay_payment_id;
  order.orderStatus = OrderStatus.CONFIRMED;
  await order.save();

  // Emit notification for Paid order
  try {
    getIO().emit('new_order', { orderId: order._id, orderNumber: order.orderNumber, amount: order.totalAmount, type: 'PAID' });
    PushService.notifyAllAdmins('New Order Received', `Order #${order.orderNumber} for ₹${order.totalAmount} (PAID)`);
  } catch (err) {
    console.log('Socket.io error:', err.message);
  }

  return response.success(order, 'Payment verified successfully');
});

// @desc    Razorpay Webhook Endpoint
// @route   POST /api/v1/orders/webhook
// @access  Public
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody; // Captured via express.json verify
  
  if (!secret || !signature || !rawBody) {
    return res.status(400).send('Webhook Error: Missing signature, raw body or secret');
  }

  const isValid = RazorpayService.verifyWebhookSignature(rawBody, signature, secret);
  
  if (!isValid) {
    return res.status(400).send('Webhook Error: Invalid signature');
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (event === 'order.paid') {
    const payment = payload.payment.entity;
    const razorpayOrderId = payment.order_id;
    const razorpayPaymentId = payment.id;

    const order = await Order.findOne({ razorpayOrderId: razorpayOrderId });
    
    if (order && order.paymentStatus !== PaymentStatus.PAID) {
      order.paymentStatus = PaymentStatus.PAID;
      order.razorpayPaymentId = razorpayPaymentId;
      order.orderStatus = OrderStatus.CONFIRMED;
      await order.save();

      try {
        getIO().emit('new_order', { orderId: order._id, orderNumber: order.orderNumber, amount: order.totalAmount, type: 'PAID_WEBHOOK' });
        PushService.notifyAllAdmins('New Order Received via Webhook', `Order #${order.orderNumber} for ₹${order.totalAmount} (PAID)`);
      } catch (err) {
        console.log('Socket.io error:', err.message);
      }
    }
  } else if (event === 'payment.failed') {
    const payment = payload.payment.entity;
    const razorpayOrderId = payment.order_id;

    const order = await Order.findOne({ razorpayOrderId: razorpayOrderId });
    if (order && order.paymentStatus !== PaymentStatus.FAILED && order.paymentStatus !== PaymentStatus.PAID) {
      order.paymentStatus = PaymentStatus.FAILED;
      order.orderStatus = OrderStatus.FAILED;
      await order.save();
    }
  } else if (event === 'refund.processed') {
    const refund = payload.refund.entity;
    const paymentId = refund.payment_id;

    const order = await Order.findOne({ razorpayPaymentId: paymentId });
    if (order && order.paymentStatus !== PaymentStatus.REFUNDED) {
      order.paymentStatus = PaymentStatus.REFUNDED;
      order.orderStatus = OrderStatus.CANCELLED;
      await order.save();
    }
  }

  // Acknowledge the webhook
  res.status(200).json({ status: 'ok' });
});

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Public
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('assignedDeliveryBoy', 'name phone');
  if (!order) throw new Error('Order not found');
  return new ApiResponse(res).success(order);
});

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ orderStatus: { $ne: OrderStatus.PENDING } }).sort({ createdAt: -1 }).populate('assignedDeliveryBoy', 'name');
  return new ApiResponse(res).success(orders);
});

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  // Orders are tied to phone numbers in address
  const orders = await Order.find({ 'address.phone': req.user.phone, orderStatus: { $ne: OrderStatus.PENDING } }).sort({ createdAt: -1 }).populate('assignedDeliveryBoy', 'name phone');
  return new ApiResponse(res).success(orders);
});

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new Error('Order not found');

  order.orderStatus = status;
  await order.save();

  return new ApiResponse(res).success(order, 'Order status updated');
});

// @desc    Assign delivery boy
// @route   PUT /api/v1/orders/:id/assign
// @access  Private/Admin
export const assignDeliveryBoy = asyncHandler(async (req, res) => {
  const { deliveryBoyId } = req.body;
  
  const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
  if (!deliveryBoy) throw new Error('Delivery Boy not found');

  const order = await Order.findById(req.params.id);
  if (!order) throw new Error('Order not found');

  order.assignedDeliveryBoy = deliveryBoyId;
  order.orderStatus = OrderStatus.ASSIGNED;
  await order.save();

  // Emit assignment to delivery boys
  try {
    getIO().emit('new_assignment', { 
      deliveryBoyId: deliveryBoy._id,
      orderId: order._id, 
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      type: order.type || 'DELIVERY'
    });
    PushService.notifyDeliveryBoy(deliveryBoy._id, 'New Order Assigned', `Order #${order.orderNumber} for ₹${order.totalAmount} has been assigned to you.`);
  } catch (err) {
    console.log('Socket.io error:', err.message);
  }

  return new ApiResponse(res).success(order, 'Delivery boy assigned successfully');
});

// @desc    Delete/Cancel an unpaid order
// @route   DELETE /api/v1/orders/:id/cancel
// @access  Public
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new Error('Order not found');

  if (order.paymentStatus === PaymentStatus.PAID) {
    throw new Error('Cannot delete a paid order');
  }

  await order.deleteOne();
  return new ApiResponse(res).success(null, 'Order cancelled successfully');
});
