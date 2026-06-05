import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Roles } from '../constants/index.js';

const deliveryBoySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  active: {
    type: Boolean,
    default: true
  },
  vehicleType: {
    type: String,
    default: 'BIKE'
  },
  role: {
    type: String,
    default: Roles.DELIVERY_BOY,
    enum: [Roles.DELIVERY_BOY]
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  resetPasswordOtp: String,
  resetPasswordOtpExpire: Date
}, { timestamps: true });

deliveryBoySchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

deliveryBoySchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('DeliveryBoy', deliveryBoySchema);
