import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchVideos = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError('');
        
        // Try to ping the server first
        try {
          await axios.get('https://streamvibe-2wb2.onrender.com');
        } catch (pingError) {
          console.log('Server ping failed, might be starting up:', pingError);
          if (retryCount < 3) {
            // Wait for 5 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
            if (!isMounted) return;
            setRetryCount(prev => prev + 1);
            throw new Error('SERVER_STARTING');
          }
        }

        const response = await axios.get(`https://streamvibe-2wb2.onrender.com/api/videos`);
        console.log('Videos fetched successfully:', response.data);
        if (!isMounted) return;
        setVideos(response.data);
        setRetryCount(0); // Reset retry count on success
      } catch (err) {
        console.error('Error fetching videos:', err);
        if (!isMounted) return;
        if (err.message === 'SERVER_STARTING') {
          setError('Server is starting up, please wait...');
          setLoading(true);
          return; // This will trigger another retry
        } else if (!err.response) {
          setError('Cannot connect to server. Please check your internet connection.');
        } else {
          setError('Error fetching videos. Please try again later.');
        }
      } finally {
        if (!isMounted) return;
        if (!error?.message?.includes('SERVER_STARTING')) {
          setLoading(false);
        }
      }
    };

    fetchVideos();

    return () => {
      isMounted = false;
    };
  }, [retryCount, error?.message]); // Added error?.message as dependency

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
          {retryCount > 0 && (
            <p className="text-gray-600">
              Server is starting up... Attempt {retryCount}/3
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
          {error}
          {error.includes('server') && (
            <p className="text-sm mt-2 text-gray-600">
              Note: The server might take a minute to start up if it hasn't been used recently.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-gray-50 rounded-xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">No Videos Yet</h2>
          <p className="text-gray-600 mb-6">
            Be the first to upload a video and start sharing!
          </p>
          <Link
            to="/upload"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Upload Video
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video relative">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {video.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoList;
