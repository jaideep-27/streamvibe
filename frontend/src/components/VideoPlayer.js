import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const VideoPlayer = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/videos/${id}`);
        setVideo(response.data);
      } catch (error) {
        setError('Error fetching video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );

  if (error) return (
    <div className="text-center mt-10 text-red-500 bg-red-50 p-4 rounded-lg">
      {error}
    </div>
  );

  if (!video) return (
    <div className="text-center mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Video not found</h2>
      <Link
        to="/"
        className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
          <video
            src={video.videoUrl}
            className="w-full aspect-video"
            controls
            autoPlay
            playsInline
          />
        </div>
        <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{video.title}</h1>
          <p className="text-gray-600 mt-2">{video.description}</p>
          <div className="mt-4 pt-4 border-t">
            <Link
              to="/"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Videos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
