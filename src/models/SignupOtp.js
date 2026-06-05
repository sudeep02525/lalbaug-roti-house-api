import mongoose from 'mongoose';

const signupOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('SignupOtp', signupOtpSchema);
