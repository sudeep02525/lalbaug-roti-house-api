import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Settings from './src/models/Settings.js';
import Product from './src/models/Product.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  // Update Settings
  const settings = await Settings.findOne();
  if (settings) {
    let updated = false;
    
    if (settings.craftDescription && settings.craftDescription.includes('authentic')) {
      settings.craftDescription = settings.craftDescription.replace(/authentic/g, 'genuine');
      updated = true;
    }
    if (settings.aboutHeroDescription && settings.aboutHeroDescription.includes('authentic')) {
      settings.aboutHeroDescription = settings.aboutHeroDescription.replace(/authentic/g, 'genuine');
      updated = true;
    }
    if (settings.missionDescription && settings.missionDescription.includes('authentic')) {
      settings.missionDescription = settings.missionDescription.replace(/authentic/g, 'traditional');
      updated = true;
    }
    
    if (settings.mumbaiSpecials && settings.mumbaiSpecials.length > 0) {
      settings.mumbaiSpecials = settings.mumbaiSpecials.map(s => {
        if (s.name.includes('Authentic')) {
          s.name = s.name.replace(/Authentic/g, 'Genuine');
          updated = true;
        }
        return s;
      });
    }

    if (updated) {
      await settings.save();
      console.log('Settings updated successfully.');
    }
  }

  // Update Products
  const products = await Product.find({});
  let productsUpdated = 0;
  for (const product of products) {
    let modified = false;
    if (product.name && product.name.includes('Authentic')) {
      product.name = product.name.replace(/Authentic/g, 'Genuine');
      modified = true;
    }
    if (product.description && product.description.includes('authentic')) {
      product.description = product.description.replace(/authentic/g, 'genuine');
      modified = true;
    }
    if (product.description && product.description.includes('Authentic')) {
      product.description = product.description.replace(/Authentic/g, 'Genuine');
      modified = true;
    }
    if (modified) {
      await product.save();
      productsUpdated++;
    }
  }
  
  console.log(`Updated ${productsUpdated} products.`);
  process.exit(0);
});
