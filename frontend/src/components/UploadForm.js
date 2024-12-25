import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

const UploadForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate file size
      if (file && file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 100MB limit');
      }

      // Create form data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('video', file);

      // Upload video
      await axios.post(`${process.env.REACT_APP_API_URL}/api/videos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
        },
      });

      // Redirect to home page after successful upload
      navigate('/');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Error uploading video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds 100MB limit');
      setFile(null);
      e.target.value = null;
    } else {
      setError('');
      setFile(selectedFile);
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
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter video title"
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
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter video description"
            />
          </div>

          <div>
            <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
              Video File
            </label>
            <input
              type="file"
              id="video"
              accept="video/*"
              onChange={handleFileChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">Maximum file size: 100MB</p>
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
