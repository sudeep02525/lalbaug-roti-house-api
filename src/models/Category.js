import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true,
    maxlength: 50
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  description: {
    type: String,
    maxlength: 500
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Basic slug generation before validation if slug is missing
categorySchema.pre('validate', function() {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
});

export default mongoose.model('Category', categorySchema);
