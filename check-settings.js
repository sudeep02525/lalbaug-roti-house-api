import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const settingsSchema = new mongoose.Schema({}, { strict: false });
const Settings = mongoose.model('Settings', settingsSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lalbaug-roti-house');
  
  const settings = await Settings.findOne();
  if (settings) {
    console.log(`Facebook URL: ${settings.get('facebookUrl')}`);
    console.log(`Instagram URL: ${settings.get('instagramUrl')}`);
  }
  
  mongoose.disconnect();
}
run();
