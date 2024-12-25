const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Video = require('../models/Video');
const { Readable } = require('stream');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
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

const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });

    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos' });
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
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Error fetching video' });
  }
});

// Upload video and thumbnail
router.post('/', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Starting upload process...');
    
    if (!req.files || !req.files.video || !req.files.thumbnail) {
      return res.status(400).json({ message: 'Both video and thumbnail are required' });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];

    console.log('Uploading video to Cloudinary...');
    const videoUpload = await uploadToCloudinary(videoFile.buffer, {
      resource_type: 'video',
      folder: 'videos'
    });

    console.log('Uploading thumbnail to Cloudinary...');
    const thumbnailUpload = await uploadToCloudinary(thumbnailFile.buffer, {
      folder: 'thumbnails'
    });

    console.log('Creating video document...');
    const video = new Video({
      title: req.body.title,
      description: req.body.description,
      thumbnailUrl: thumbnailUpload.secure_url,
      videoUrl: videoUpload.secure_url,
      cloudinaryThumbnailId: thumbnailUpload.public_id,
      cloudinaryVideoId: videoUpload.public_id
    });

    await video.save();
    console.log('Video saved successfully');
    
    res.status(201).json(video);
  } catch (error) {
    console.error('Error in upload process:', error);
    res.status(500).json({ 
      message: 'Error uploading video',
      details: error.message 
    });
  }
});

module.exports = router;
