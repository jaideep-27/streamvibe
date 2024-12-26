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
      if (file.mimetype === 'video/mp4' || file.mimetype === 'video/avi' || file.mimetype === 'video/mpeg') {
        cb(null, true);
      } else {
        cb(new Error('Invalid video format. Only MP4, AVI, and MPG are allowed.'));
      }
    }
  }
});

const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    console.log('Starting Cloudinary upload with options:', options);
    const uploadStream = cloudinary.uploader.upload_stream(
      { ...options, resource_type: options.resource_type || 'auto' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload success:', result.secure_url);
          resolve(result);
        }
      }
    );

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
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Starting upload process...');
    console.log('Files received:', req.files);
    console.log('Body received:', req.body);
    
    if (!req.files || !req.files.video || !req.files.thumbnail) {
      return res.status(400).json({ 
        message: 'Both video and thumbnail are required',
        received: {
          video: !!req.files?.video,
          thumbnail: !!req.files?.thumbnail
        }
      });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail[0];

    console.log('File details:', {
      video: {
        size: videoFile.size,
        mimetype: videoFile.mimetype,
        originalname: videoFile.originalname
      },
      thumbnail: {
        size: thumbnailFile.size,
        mimetype: thumbnailFile.mimetype,
        originalname: thumbnailFile.originalname
      }
    });

    console.log('Uploading video to Cloudinary...');
    const videoUpload = await uploadToCloudinary(videoFile.buffer, {
      resource_type: 'video',
      folder: 'videos',
      chunk_size: 6000000
    });

    console.log('Uploading thumbnail to Cloudinary...');
    const thumbnailUpload = await uploadToCloudinary(thumbnailFile.buffer, {
      folder: 'thumbnails',
      resource_type: 'image'
    });

    console.log('Creating video document...');
    const video = new Video({
      title: req.body.title,
      description: req.body.description,
      videoUrl: videoUpload.secure_url,
      thumbnailUrl: thumbnailUpload.secure_url,
      cloudinaryVideoId: videoUpload.public_id,
      cloudinaryThumbnailId: thumbnailUpload.public_id
    });

    await video.save();
    console.log('Video saved successfully:', video);
    
    res.status(201).json(video);
  } catch (error) {
    console.error('Error in upload process:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      http_code: error.http_code,
      stack: error.stack
    });
    
    let errorMessage = 'Error uploading video. ';
    
    if (error.message.includes('Invalid video format')) {
      res.status(400).json({ message: error.message });
    } else if (error.message.includes('Invalid image format')) {
      res.status(400).json({ message: error.message });
    } else if (error.http_code === 413 || error.message.includes('file size')) {
      res.status(413).json({ message: 'File size too large. Maximum size is 100MB.' });
    } else {
      res.status(500).json({ 
        message: errorMessage + (error.message || 'Please try again.'),
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

module.exports = router;
