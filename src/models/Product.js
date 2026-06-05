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
  images: [{
    type: String
  }],
  active: { type: Boolean, default: true }, isBestseller: { type: Boolean, default: false }, isDailyCombo: { type: Boolean, default: false },
  addons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Addon'
  }]
}, { timestamps: true });

productSchema.pre('validate', function() {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
});

export default mongoose.model('Product', productSchema);
