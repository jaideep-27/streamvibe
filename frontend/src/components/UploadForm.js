import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/mpeg'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

const UploadForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

      await axios.post(`https://streamvibe-2wb2.onrender.com/api/videos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
        },
      });

      navigate('/');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Error uploading files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, setFile, allowedTypes, maxSize = MAX_FILE_SIZE) => {
    const file = e.target.files[0];
    const error = validateFile(file, allowedTypes, maxSize);
    if (error) {
      setError(error);
      setFile(null);
      e.target.value = null;
    } else {
      setError('');
      setFile(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Video</h2>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter video title (max 50 characters)"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter video description (max 200 characters)"
            />
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail Image
            </label>
            <input
              type="file"
              id="thumbnail"
              accept="image/jpeg,image/png"
              onChange={(e) => handleFileChange(e, setThumbnailFile, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">Accepted formats: JPG, PNG (max 5MB)</p>
          </div>

          <div>
            <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
              Video File
            </label>
            <input
              type="file"
              id="video"
              accept="video/mp4,video/avi,video/mpeg"
              onChange={(e) => handleFileChange(e, setVideoFile, ALLOWED_VIDEO_TYPES)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">Accepted formats: MP4, AVI, MPG (max 100MB)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 text-white rounded-lg ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:opacity-90 transition-opacity duration-300'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Uploading...
              </div>
            ) : (
              'Upload Video'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;
