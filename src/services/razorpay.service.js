import crypto from 'crypto';
import getRazorpayInstance from '../config/razorpay.js';

class RazorpayService {
  static async createOrder(amount, receipt) {
    const instance = getRazorpayInstance();
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: receipt
    };
    
    try {
      const order = await instance.orders.create(options);
      return order;
    } catch (error) {
      console.error("Razorpay Create Order Error:", error);
      throw new Error('Failed to create payment order');
    }
  }

  static verifySignature(orderId, paymentId, signature) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return false;

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(orderId + "|" + paymentId)
      .digest('hex');
      
    return generatedSignature === signature;
  }
  static verifyWebhookSignature(rawBody, signature, secret) {
    if (!secret || !rawBody) return false;

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
      
    return generatedSignature === signature;
  }
}

export default RazorpayService;
