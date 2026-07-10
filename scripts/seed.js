import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Admin from '../src/models/Admin.js';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';
import Variant from '../src/models/Variant.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    await Admin.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Variant.deleteMany();

    // Create Admin
    await Admin.create({
      name: 'Admin User',
      email: 'lalbaugrotihouse@gmail.com',
      password: 'lalbaugrotihouse'
    });

    // Create Category
    const category = await Category.create({
      name: 'Indian Breads',
      description: 'Traditional Indian Rotis and Naans'
    });

    // Create Product
    const product = await Product.create({
      categoryId: category._id,
      name: 'Plain Roti',
      description: 'Soft and healthy wheat roti'
    });

    // Create Variants
    await Variant.create([
      {
        productId: product._id,
        name: 'Single',
        price: 12,
        minQuantity: 1
      },
      {
        productId: product._id,
        name: 'Pack Of 5',
        price: 50,
        minQuantity: 1
      }
    ]);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(error.stack);
    process.exit(1);
  }
};

importData();
