import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const VideoPlayer = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/videos/${id}`);
        setVideo(response.data);
      } catch (error) {
        console.error('Error fetching video:', error);
        setError('Error fetching video. Please try again later.');
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
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
        {error}
      </div>
    </div>
  );

  if (!video) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="aspect-video relative">
            <video
              src={video.videoUrl}
              controls
              className="w-full h-full"
              poster={video.thumbnailUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
            <p className="text-gray-600">{video.description}</p>
          </div>
        </div>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Videos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
