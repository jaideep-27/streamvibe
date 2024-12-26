import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log('Fetching videos...');
        const response = await axios.get('/api/videos');
        console.log('Videos received:', response.data);
        setVideos(response.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-gray-600 text-lg mb-4">No videos uploaded yet</p>
          <Link 
            to="/upload" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            Upload Your First Video
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {videos.map((video) => (
          <div key={video._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
            <Link to={`/video/${video._id}`}>
              <div className="aspect-video w-full relative">
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                  style={{ maxHeight: '200px' }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1">{video.title}</h3>
              </div>
            </Link>
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{video.description || 'No description available'}</p>
              <Link 
                to={`/video/${video._id}`}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                </svg>
                Watch Video
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoList;
