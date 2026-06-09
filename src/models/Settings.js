import mongoose from 'mongoose';

const deliverySlabSchema = new mongoose.Schema({
  maxKm: { type: Number, required: true },
  charge: { type: Number, required: true }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'Lalbaug Roti House' },
  restaurantPhone: { type: String, default: '9324688099' },
  restaurantLat: { type: Number, default: 18.9950 },
  restaurantLng: { type: Number, default: 72.8396 },
  minOrderQty: { type: Number, default: 5 },
  maxRadiusKm: { type: Number, default: 20 },
  isAcceptingOrders: { type: Boolean, default: true },
  serviceStartTime: { type: String, default: '09:00' },
  serviceEndTime: { type: String, default: '22:00' },
  deliverySlabs: {
    type: [deliverySlabSchema],
    default: [
      { maxKm: 3, charge: 20 },
      { maxKm: 5, charge: 30 },
      { maxKm: 8, charge: 50 },
      { maxKm: 12, charge: 70 },
      { maxKm: 20, charge: 100 }
    ]
  }
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
