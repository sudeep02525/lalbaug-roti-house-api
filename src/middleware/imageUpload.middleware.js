import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lalbaug-roti-house/products',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
  },
});

const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lalbaug-roti-house/banners',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
  },
});

export const uploadProductImageMiddleware = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const uploadBannerImageMiddleware = multer({
  storage: bannerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// For backward compatibility until we replace the default import
const uploadImage = uploadProductImageMiddleware;
export default uploadImage;
