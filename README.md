# Video Upload Application

A full-stack MERN application for uploading and streaming videos with Cloudinary integration.

## Features

- Upload videos and thumbnails
- Video streaming
- Cloudinary integration
- Responsive design

## Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB
- Cloud Storage: Cloudinary
- Deployment: Vercel (Frontend), Cyclic/Render (Backend)

## Setup Instructions

### Backend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a .env file with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. Run the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
