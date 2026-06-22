import PushSubscription from '../models/PushSubscription.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

// @desc    Subscribe to push notifications
// @route   POST /api/v1/push/subscribe
// @access  Private
export const subscribe = asyncHandler(async (req, res) => {
  const subscription = req.body;
  const response = new ApiResponse(res);

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    throw new Error('Invalid subscription payload');
  }

  // Check if subscription already exists, if so update it, else create
  let existingSub = await PushSubscription.findOne({ endpoint: subscription.endpoint });

  if (existingSub) {
    existingSub.keys = subscription.keys;
    existingSub.expirationTime = subscription.expirationTime;
    if (subscription.userId) existingSub.userId = subscription.userId;
    if (subscription.role) existingSub.role = subscription.role;
    await existingSub.save();
    return response.success(existingSub, 'Subscription updated successfully');
  }

  const newSub = await PushSubscription.create(subscription);
  return response.success(newSub, 'Subscription created successfully', 201);
});

// @desc    Unsubscribe from push notifications
// @route   POST /api/v1/push/unsubscribe
// @access  Private
export const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;
  const response = new ApiResponse(res);

  if (!endpoint) {
    throw new Error('Endpoint is required');
  }

  await PushSubscription.findOneAndDelete({ endpoint });
  return response.success(null, 'Subscription removed successfully');
});
