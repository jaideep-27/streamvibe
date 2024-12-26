import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/mpeg'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

const UploadForm = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const validateFile = (file, allowedTypes, maxSize = MAX_FILE_SIZE) => {
    if (!file) return 'File is required';
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`;
    }
    if (file.size > maxSize) {
      return 'File size exceeds limit';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate files
    const videoError = validateFile(videoFile, ALLOWED_VIDEO_TYPES);
    const thumbnailError = validateFile(thumbnailFile, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024); // 5MB limit for thumbnails

    if (videoError || thumbnailError) {
      setError(videoError || thumbnailError);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('video', videoFile);
      formData.append('thumbnail', thumbnailFile);

      console.log('Starting upload...');
      const response = await axios.post('/api/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
          // Removed setUploadProgress(percentCompleted);
        },
      });
      console.log('Upload successful:', response.data);
      navigate('/');
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Error uploading video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    const error = validateFile(file, ALLOWED_VIDEO_TYPES);
    if (error) {
      setError(error);
      setVideoFile(null);
      e.target.value = null;
    } else {
      setError('');
      setVideoFile(file);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    const error = validateFile(file, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024);
    if (error) {
      setError(error);
      setThumbnailFile(null);
      e.target.value = null;
    } else {
      setError('');
      setThumbnailFile(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Upload Video</h2>
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Video Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows="4"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Video File</label>
          <input
            type="file"
            onChange={handleVideoChange}
            accept="video/*"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Accepted formats: MP4, AVI, MPG (max 100MB)</p>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Thumbnail</label>
          <input
            type="file"
            onChange={handleThumbnailChange}
            accept="image/*"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Accepted formats: JPG, PNG, GIF (max 5MB)</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
          } text-white font-medium rounded-lg transition-all duration-200`}
        >
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
