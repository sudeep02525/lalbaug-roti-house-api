import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  details: {
    type: String,
    maxlength: 5000
  },
  images: [{
    type: String
  }],
  active: { type: Boolean, default: true }, 
  isBestseller: { type: Boolean, default: false }, 
  isDailyCombo: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  addons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Addon'
  }],
  badges: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

productSchema.pre('validate', function() {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
});

export default mongoose.model('Product', productSchema);
