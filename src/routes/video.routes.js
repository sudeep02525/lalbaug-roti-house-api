import express from 'express';
import { uploadVideo, getVideos, deleteVideo } from '../controllers/video.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { Roles } from '../constants/index.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

const adminOnly = [protect, authorize(Roles.ADMIN, Roles.CMS_ADMIN)];

router
  .route('/')
  .get(getVideos)
  .post(adminOnly, upload.single('video'), uploadVideo);

router
  .route('/:id')
  .delete(adminOnly, deleteVideo);

export default router;
