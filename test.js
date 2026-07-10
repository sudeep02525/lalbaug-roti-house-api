import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './src/models/Product.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const prods = await Product.find({});
  console.log(`Found ${prods.length} products`);
  prods.forEach(prod => console.log(prod.name, prod.images));
  process.exit(0);
});
