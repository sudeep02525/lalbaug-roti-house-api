import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const updateDescriptions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    let updatedCount = 0;

    for (let product of products) {
      let updated = false;
      
      if (product.description) {
        let newDesc = product.description;
        newDesc = newDesc.replace(/homely/gi, 'genuine');
        newDesc = newDesc.replace(/homemade/gi, '');
        newDesc = newDesc.replace(/home-made/gi, '');
        newDesc = newDesc.replace(/Maharashtrian/gi, 'Traditional');
        newDesc = newDesc.replace(/Maharashtria/gi, 'Traditional');
        
        // Clean up any double spaces caused by removing words
        newDesc = newDesc.replace(/\s+/g, ' ').trim();

        if (newDesc !== product.description) {
          product.description = newDesc;
          updated = true;
        }
      }

      if (updated) {
        await product.save();
        updatedCount++;
      }
    }

    const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
    for (let category of categories) {
      let updated = false;
      if (category.description) {
        let newDesc = category.description;
        newDesc = newDesc.replace(/homely/gi, 'genuine');
        newDesc = newDesc.replace(/homemade/gi, '');
        newDesc = newDesc.replace(/home-made/gi, '');
        newDesc = newDesc.replace(/Maharashtrian/gi, 'Traditional');
        newDesc = newDesc.replace(/Maharashtria/gi, 'Traditional');
        newDesc = newDesc.replace(/\s+/g, ' ').trim();
        if (newDesc !== category.description) {
          await mongoose.connection.db.collection('categories').updateOne({ _id: category._id }, { $set: { description: newDesc } });
          updatedCount++;
        }
      }
    }

    console.log(`Updated ${updatedCount} items.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateDescriptions();
