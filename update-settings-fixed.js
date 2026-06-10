import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const updateDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  const Settings = mongoose.model('Settings', new mongoose.Schema({}, { strict: false }));
  
  const result = await Settings.updateOne({}, {
    $set: {
      craftImages: [
        '/images/wheat_background.png',
        '/images/dough_preparation.png'
      ]
    }
  });
  
  console.log('Settings updated:', result);
  mongoose.disconnect();
};

updateDB();
