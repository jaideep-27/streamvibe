# StreamVibe - Video Sharing Platform

A modern video sharing platform built with React, Node.js, MongoDB, and Cloudinary integration.

## Features

- Upload videos with thumbnails
- Video format support: MP4, AVI, MPG
- Thumbnail format support: JPG, PNG
- Video listing with thumbnails
- Automatic video playback
- Responsive design
- Cloud storage with Cloudinary

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd streamvibe
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the values in both `.env` files:
     - Backend `.env`:
       - `MONGODB_URI`: Your MongoDB connection string
       - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
       - `CLOUDINARY_API_KEY`: Your Cloudinary API key
       - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
     - Frontend `.env`:
       - `REACT_APP_API_URL`: Your backend API URL (default: http://localhost:5000)

4. Start the development servers:
   ```bash
   # Start backend server (from backend directory)
   npm start

   # Start frontend server (from frontend directory)
   npm start
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Deployment

### Frontend (Netlify)
1. Create a new site in Netlify
2. Connect your GitHub repository
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Add environment variables in Netlify settings

### Backend (Render)
1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Set build settings:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables in Render settings

## File Size Limits
- Video files: Maximum 100MB
- Thumbnail images: Maximum 5MB

## Contributing
Feel free to submit issues and pull requests.

## License
MIT License
