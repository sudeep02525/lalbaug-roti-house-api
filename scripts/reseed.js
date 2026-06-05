import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
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

    await Category.deleteMany();
    await Product.deleteMany();
    await Variant.deleteMany();

    // Create Categories
    const rotiCat = await Category.create({ name: 'Roti', description: 'Freshly made rotis', active: true });
    const comboCat = await Category.create({ name: 'Daily Combo', description: 'Complete meals', active: true });

    // Create Roti Products
    const rotiNames = ['Plain Roti', 'Sabji Roti', 'Tandoori Roti', 'Wheat Roti'];
    const rotiImages = ['/images/Plain-Roti.jpeg', '/images/Sabji-Roti.png', '/images/Plain-Roti.jpeg', '/images/Plain-Roti.jpeg'];
    
    for (let i = 0; i < rotiNames.length; i++) {
        const prod = await Product.create({
            categoryId: rotiCat._id,
            name: rotiNames[i],
            description: 'Delicious and fresh',
            images: [rotiImages[i]],
            active: true
        });
        
        await Variant.create([
            { productId: prod._id, name: 'Single', price: 15, minQuantity: 1, active: true },
            { productId: prod._id, name: 'Pack of 5', price: 70, minQuantity: 5, active: true }
        ]);
    }

    // Create Daily Combos
    const comboNames = ['Lunch Combo', 'Dinner Combo', 'Family Combo'];
    for (let i = 0; i < comboNames.length; i++) {
        const prod = await Product.create({
            categoryId: comboCat._id,
            name: comboNames[i],
            description: 'A complete meal for you',
            images: ['/images/indian_roti_meal.png'],
            active: true
        });
        
        await Variant.create([
            { productId: prod._id, name: 'Regular', price: 120, minQuantity: 1, active: true }
        ]);
    }

    console.log('Database Re-seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(error.stack);
    process.exit(1);
  }
};

importData();
