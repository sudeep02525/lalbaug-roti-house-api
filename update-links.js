import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const settingsSchema = new mongoose.Schema({
  facebookUrl: String,
  instagramUrl: String
}, { strict: false });

const Settings = mongoose.model('Settings', settingsSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lalbaug-roti-house');
  const settings = await Settings.findOne();
  if (settings) {
    settings.facebookUrl = 'https://www.facebook.com/share/1XwJ1zQMs4/';
    settings.instagramUrl = 'https://www.instagram.com/lalbaug_roti_house?igsh=em9jeDA5anMzM205';
    await settings.save();
    console.log('Updated settings successfully');
  } else {
    console.log('No settings found');
  }
  mongoose.disconnect();
}
run();
