import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import Product from './src/models/Product.js';
import Settings from './src/models/Settings.js';
import Video from './src/models/Video.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localPath, folder, resourceType = 'image') => {
  try {
    const absolutePath = path.join(process.cwd(), 'public', localPath);
    if (!fs.existsSync(absolutePath)) {
      console.warn(`File not found: ${absolutePath}`);
      return null;
    }
    console.log(`Uploading ${localPath} to Cloudinary folder ${folder}...`);
    const result = await cloudinary.uploader.upload(absolutePath, {
      folder: folder,
      resource_type: resourceType,
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${localPath}:`, error);
    return null;
  }
};

const migrateProducts = async () => {
  console.log('Migrating Products...');
  const products = await Product.find({});
  for (const product of products) {
    let updated = false;
    const newImages = [];
    for (const image of product.images) {
      if (image && (image.startsWith('/uploads/') || image.startsWith('/images/'))) {
        const cloudinaryUrl = await uploadToCloudinary(image, 'lalbaug-roti-house/products');
        if (cloudinaryUrl) {
          newImages.push(cloudinaryUrl);
          updated = true;
        } else {
          newImages.push(image); // keep old if failed
        }
      } else {
        newImages.push(image);
      }
    }
    if (updated) {
      product.images = newImages;
      await product.save();
      console.log(`Updated Product: ${product.name}`);
    }
  }
};

const migrateSettings = async () => {
  console.log('Migrating Settings (Banners)...');
  const settings = await Settings.findOne();
  if (!settings) return;

  let updated = false;

  const processImageField = async (field) => {
    const image = settings[field];
    if (image && (image.startsWith('/uploads/') || image.startsWith('/images/'))) {
      const url = await uploadToCloudinary(image, 'lalbaug-roti-house/banners');
      if (url) {
        settings[field] = url;
        updated = true;
      }
    }
  };

  await processImageField('heroImage');
  await processImageField('craftImage');

  const newCraftImages = [];
  for (const image of settings.craftImages) {
    if (image && (image.startsWith('/uploads/') || image.startsWith('/images/'))) {
      const url = await uploadToCloudinary(image, 'lalbaug-roti-house/banners');
      if (url) {
        newCraftImages.push(url);
        updated = true;
      } else {
        newCraftImages.push(image);
      }
    } else {
      newCraftImages.push(image);
    }
  }
  settings.craftImages = newCraftImages;

  if (updated) {
    await settings.save();
    console.log('Updated Settings banners');
  }
};

const migrateVideos = async () => {
  console.log('Migrating Videos...');
  const videos = await Video.find({});
  for (const video of videos) {
    if (video.url && video.url.startsWith('/uploads/')) {
      const cloudinaryUrl = await uploadToCloudinary(video.url, 'lalbaug-roti-house/videos', 'video');
      if (cloudinaryUrl) {
        video.url = cloudinaryUrl;
        await video.save();
        console.log(`Updated Video: ${video.title}`);
      }
    }
  }
};

const startMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    await migrateProducts();
    await migrateSettings();
    await migrateVideos();

    console.log('Migration Completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

startMigration();
