import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lalbaug-roti-house/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'mkv', 'avi', 'mov'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

export default upload;
