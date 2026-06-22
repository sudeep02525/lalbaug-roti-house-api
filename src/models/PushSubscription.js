import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  expirationTime: {
    type: Date,
    default: null,
  },
  keys: {
    p256dh: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,
    },
  },
  userId: {
    type: String, // String to handle both admin and delivery boy IDs if needed
  },
  role: {
    type: String,
    enum: ['admin', 'delivery'],
    default: 'admin'
  }
}, {
  timestamps: true
});

const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);

export default PushSubscription;
