import Video from '../models/Video.js';
import fs from 'fs';
import path from 'path';

// @desc    Upload a new video
// @route   POST /api/v1/videos
// @access  Private/Admin
export const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a video file' });
    }

    const { title } = req.body;
    
    // Construct the URL to access the video
    // In production, this would be your actual domain
    const url = `/uploads/videos/${req.file.filename}`;

    const video = await Video.create({
      title: title || 'Untitled Video',
      url,
    });

    res.status(201).json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active videos
// @route   GET /api/v1/videos
// @access  Public
export const getVideos = async (req, res, next) => {
  try {
    const videos = await Video.find({ isActive: true }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a video
// @route   DELETE /api/v1/videos/:id
// @access  Private/Admin
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'public', video.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await video.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
