import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const updateDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  const Settings = mongoose.model('Settings', new mongoose.Schema({}, { strict: false }));
  
  const settings = await Settings.findOne();
  if (settings) {
    settings.craftImages = [
      '/images/wheat_background.png',
      '/images/dough_preparation.png'
    ];
    await settings.save();
    console.log('Settings updated successfully!');
  } else {
    console.log('No settings found');
  }
  
  mongoose.disconnect();
};

updateDB();
