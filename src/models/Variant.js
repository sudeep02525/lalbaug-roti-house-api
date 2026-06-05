import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a variant name (e.g. Single, Pack Of 5)'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  minQuantity: {
    type: Number,
    default: 1
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Variant', variantSchema);
