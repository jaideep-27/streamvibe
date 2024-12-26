import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchVideos = async () => {
      try {
        const response = await axios.get('/api/videos', {
          timeout: 5000 // 5 second timeout
        });
        
        if (mounted && response.data) {
          setVideos(response.data);
        }
      } catch (error) {
        console.error('Error:', error.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchVideos();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] bg-gray-50">
        <div className="text-center p-6">
          <p className="text-gray-600 text-lg mb-4">No videos uploaded yet</p>
          <Link 
            to="/upload" 
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow hover:shadow-lg"
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
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="relative h-40">
              <img 
                src={video.thumbnailUrl} 
                alt={video.title}
                className="w-full h-full object-cover rounded-t-lg"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 line-clamp-1">{video.title}</h3>
              {video.description && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{video.description}</p>
              )}
              <Link 
                to={`/video/${video._id}`}
                className="mt-3 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                </svg>
                Watch
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoList;
