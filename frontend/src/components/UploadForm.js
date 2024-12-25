import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

const UploadForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video: null,
    thumbnail: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file, type) => {
    if (!file) return null;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `${type} file size is too large. Maximum size is 100MB.`;
    }

    // Check file type
    if (type === 'video') {
      const validTypes = ['video/mp4', 'video/avi', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        return 'Invalid video format. Only MP4, AVI, and MOV are allowed.';
      }
    } else if (type === 'thumbnail') {
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        return 'Invalid image format. Only JPG and PNG are allowed.';
      }
    }

    return null;
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const error = validateFile(file, name);
      
      if (error) {
        setError(error);
        e.target.value = ''; // Reset file input
        return;
      }

      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      setError(''); // Clear any previous errors
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Validate files again before upload
      const videoError = validateFile(formData.video, 'video');
      const thumbnailError = validateFile(formData.thumbnail, 'thumbnail');
      
      if (videoError || thumbnailError) {
        throw new Error(videoError || thumbnailError);
      }

      if (!formData.video || !formData.thumbnail) {
        throw new Error('Please select both video and thumbnail files');
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('video', formData.video);
      data.append('thumbnail', formData.thumbnail);

      const apiUrl = `${process.env.REACT_APP_API_URL}/api/videos`;
      console.log('Starting upload to:', apiUrl);
      console.log('Files being uploaded:', {
        video: {
          name: formData.video.name,
          size: formData.video.size,
          type: formData.video.type
        },
        thumbnail: {
          name: formData.thumbnail.name,
          size: formData.thumbnail.size,
          type: formData.thumbnail.type
        }
      });

      // First, try to ping the server
      try {
        const pingResponse = await axios.get(process.env.REACT_APP_API_URL);
        console.log('Server is responsive:', pingResponse.status);
      } catch (pingError) {
        console.error('Server ping failed:', pingError);
        if (!pingError.response) {
          throw new Error('Cannot connect to server. It might be starting up - please wait a minute and try again.');
        }
      }
      
      const response = await axios.post(apiUrl, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
          console.log('Upload progress:', progress);
        },
        timeout: 300000, // 5 minutes timeout
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Don't reject if status is not 2xx
        }
      });

      if (response.status !== 201) {
        console.error('Upload response:', response);
        throw new Error(`Server returned status ${response.status}: ${response.data?.message || 'Unknown error'}`);
      }

      console.log('Upload successful:', response.data);
      navigate('/');
    } catch (err) {
      console.error('Upload error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });

      let errorMessage = 'Error uploading video. ';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error. The server might be starting up - please wait a minute and try again.';
      } else if (err.response?.status === 413) {
        errorMessage = 'File size too large. Maximum size is 100MB.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Upload timed out. Please try again with a smaller file or check your connection.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Upload Your Video</h2>
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
            maxLength={50}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.title.length}/50 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            maxLength={200}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.description.length}/200 characters
          </p>
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
                  accept="image/jpeg,image/png"
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
                  accept="video/mp4,video/avi,video/quicktime"
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
                    <span className="text-sm text-gray-500">MP4, AVI, MOV up to 100MB</span>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
        >
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

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

export default UploadForm;
