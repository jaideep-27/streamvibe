import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/videos`);
        setVideos(response.data);
      } catch (error) {
        setError('Error fetching videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center mt-10 text-red-500 bg-red-50 p-4 rounded-lg animate-fade-in">
      {error}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Featured Videos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <Link
            key={video._id}
            to={`/video/${video._id}`}
            className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative aspect-square">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to play
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-primary-600 transition-colors">
                {video.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {video.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {videos.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl text-gray-600">No videos uploaded yet</h3>
          <Link
            to="/upload"
            className="inline-block mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Upload Your First Video
          </Link>
        </div>
      )}
    </div>
  );
};

export default VideoList;
