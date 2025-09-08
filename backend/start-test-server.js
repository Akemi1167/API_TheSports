/**
 * Simple test server for video stream endpoints
 */

const express = require('express');
const mongoose = require('mongoose');
const videoStreamRoutes = require('./src/routes/videoStreamRoutes');

const app = express();
app.use(express.json());
app.use('/api/video-streams', videoStreamRoutes);

mongoose.connect('mongodb://localhost:27017/thesports', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  
  app.listen(3002, () => {
    console.log('🚀 Video Stream Test Server running on port 3002');
    console.log('');
    console.log('Available endpoints:');
    console.log('- GET http://localhost:3002/api/video-streams/upcoming?hours=24');
    console.log('- GET http://localhost:3002/api/video-streams/upcoming?hours=6');
    console.log('- GET http://localhost:3002/api/video-streams/active');
    console.log('- GET http://localhost:3002/api/video-streams/live');
    console.log('- GET http://localhost:3002/api/video-streams/status');
  });
})
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});
