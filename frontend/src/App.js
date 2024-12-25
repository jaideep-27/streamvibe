import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadForm from './components/UploadForm';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  StreamVibe
                </span>
              </Link>
              <Link
                to="/upload"
                className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Upload Video
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<VideoList />} />
            <Route path="/upload" element={<UploadForm />} />
            <Route path="/video/:id" element={<VideoPlayer />} />
          </Routes>
        </main>

        <footer className="bg-white border-t mt-auto">
          <div className="container mx-auto px-6 py-4">
            <p className="text-center text-gray-600">
              2024 StreamVibe. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
