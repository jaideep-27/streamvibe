import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FilePreview = ({ file, onRemove, type }) => (
  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
    <div className="flex items-center">
      <svg className="w-6 h-6 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {type === 'video' ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        )}
      </svg>
      <span className="font-medium text-gray-700">{file.name}</span>
    </div>
    <button
      type="button"
      onClick={onRemove}
      className="text-red-500 hover:text-red-700"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

const UploadForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video: null,
    thumbnail: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));

      if (name === 'thumbnail') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailPreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      if (!formData.video || !formData.thumbnail) {
        throw new Error('Please select both video and thumbnail files');
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('video', formData.video);
      data.append('thumbnail', formData.thumbnail);

      console.log('Starting upload to:', `${process.env.REACT_APP_API_URL}/api/videos`);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/videos`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
          console.log('Upload progress:', progress);
        }
      });

      console.log('Upload response:', response.data);
      navigate('/');
    } catch (err) {
      console.error('Upload error details:', err.response?.data || err.message);
      let errorMessage = 'Error uploading video. ';
      
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.message.includes('Network Error')) {
        errorMessage += 'Network error. Please check your connection.';
      } else if (err.response?.status === 413) {
        errorMessage += 'File size too large. Maximum size is 100MB.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Your Video</h1>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              maxLength="50"
              required
            />
            <p className="text-sm text-gray-500 mt-1">{formData.title.length}/50 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="4"
              maxLength="200"
              required
            />
            <p className="text-sm text-gray-500 mt-1">{formData.description.length}/200 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail
            </label>
            <div className="space-y-4">
              {formData.thumbnail ? (
                <FilePreview
                  file={formData.thumbnail}
                  type="image"
                  onRemove={() => setFormData(prev => ({ ...prev, thumbnail: null }))}
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    name="thumbnail"
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg"
                    className="hidden"
                    id="thumbnail-upload"
                    required
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="cursor-pointer text-gray-600 hover:text-primary-600"
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Upload a file or drag and drop</span>
                      <span className="text-sm text-gray-500">PNG, JPG up to 10MB</span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video
            </label>
            <div className="space-y-4">
              {formData.video ? (
                <FilePreview
                  file={formData.video}
                  type="video"
                  onRemove={() => setFormData(prev => ({ ...prev, video: null }))}
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    name="video"
                    onChange={handleFileChange}
                    accept="video/mp4,video/avi"
                    className="hidden"
                    id="video-upload"
                    required
                  />
                  <label
                    htmlFor="video-upload"
                    className="cursor-pointer text-gray-600 hover:text-primary-600"
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Upload a file or drag and drop</span>
                      <span className="text-sm text-gray-500">MP4, AVI up to 100MB</span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-sm text-gray-600 text-center mt-2">Uploading... {uploadProgress}%</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'
            } transition-colors duration-300`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
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
