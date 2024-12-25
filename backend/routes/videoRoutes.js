const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Video = require('../models/Video');

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
      } else {
        cb(new Error('Invalid image format. Only JPG and PNG are allowed.'));
      }
    } else if (file.fieldname === 'video') {
      if (['video/mpeg', 'video/avi', 'video/mp4'].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid video format. Only MPG, AVI, and MP4 are allowed.'));
      }
    }
  }
});

// Upload video and thumbnail
router.post('/', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Upload thumbnail to Cloudinary
    const thumbnailResult = await cloudinary.uploader.upload(
      `data:${req.files.thumbnail[0].mimetype};base64,${req.files.thumbnail[0].buffer.toString('base64')}`,
      { folder: 'thumbnails' }
    );

    // Upload video to Cloudinary
    const videoResult = await cloudinary.uploader.upload(
      `data:${req.files.video[0].mimetype};base64,${req.files.video[0].buffer.toString('base64')}`,
      { 
        folder: 'videos',
        resource_type: 'video'
      }
    );

    // Create new video document
    const video = new Video({
      title,
      description,
      thumbnailUrl: thumbnailResult.secure_url,
      videoUrl: videoResult.secure_url,
      cloudinaryThumbnailId: thumbnailResult.public_id,
      cloudinaryVideoId: videoResult.public_id
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
