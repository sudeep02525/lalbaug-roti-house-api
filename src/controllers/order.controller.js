import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import DeliveryBoy from '../models/DeliveryBoy.js';
import DeliveryService from '../services/delivery.service.js';
import RazorpayService from '../services/razorpay.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import { OrderStatus, PaymentStatus, DeliverySettings } from '../constants/index.js';

// Assume the restaurant's coordinates are fixed for this example
const RESTAURANT_LAT = 18.9690;
const RESTAURANT_LON = 72.8311;

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Public (Guest Checkout)
export const createOrder = asyncHandler(async (req, res) => {
  const { items, address, notes, paymentMethod } = req.body;
  const response = new ApiResponse(res);

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
  
  const order = await Order.create({
    orderNumber,
    items: processedItems,
    subtotal,
    deliveryCharge,
    totalAmount,
    deliveryDistance: distance,
    address,
    notes
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

  return response.success(order, 'Payment verified successfully');
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
  const orders = await Order.find().sort({ createdAt: -1 }).populate('assignedDeliveryBoy', 'name');
  return new ApiResponse(res).success(orders);
});

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  // Orders are tied to phone numbers in address
  const orders = await Order.find({ 'address.phone': req.user.phone }).sort({ createdAt: -1 }).populate('assignedDeliveryBoy', 'name phone');
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
  order.orderStatus = OrderStatus.OUT_FOR_DELIVERY;
  await order.save();

  return new ApiResponse(res).success(order, 'Delivery boy assigned successfully');
});
