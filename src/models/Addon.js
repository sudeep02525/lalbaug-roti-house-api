import mongoose from 'mongoose';

const addonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an addon name'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Addon', addonSchema);
