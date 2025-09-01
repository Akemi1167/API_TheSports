const cron = require('node-cron');
const axios = require('axios');
const VideoStream = require('../models/videoStream');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu video streams
const syncVideoStreams = async () => {
  try {
    console.log('🎥 Starting video streams synchronization...');
    
    // Gọi API để lấy dữ liệu video streams
    const response = await axios.get(`${API_CONFIG.baseURL}/video/push/stream/list`, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });

    const videoStreams = response.data.results || [];
    console.log(`📡 Fetched ${videoStreams.length} video streams from API`);

    let insertCount = 0;
    let updateCount = 0;

    // Xử lý từng video stream
    for (const streamData of videoStreams) {
      try {
        // Tìm video stream có sẵn theo match_id
        const existingStream = await VideoStream.findOne({ match_id: streamData.match_id });

        if (existingStream) {
          // Cập nhật nếu có thay đổi
          const hasChanges = 
            existingStream.sport_id !== streamData.sport_id ||
            existingStream.match_time !== streamData.match_time ||
            existingStream.pushurl1 !== streamData.pushurl1 ||
            existingStream.pushurl2 !== streamData.pushurl2;

          if (hasChanges) {
            await VideoStream.updateOne(
              { match_id: streamData.match_id },
              {
                sport_id: streamData.sport_id,
                match_time: streamData.match_time,
                pushurl1: streamData.pushurl1,
                pushurl2: streamData.pushurl2 || '',
                updated_at: new Date()
              }
            );
            updateCount++;
          }
        } else {
          // Tạo mới video stream
          await VideoStream.create({
            sport_id: streamData.sport_id,
            match_id: streamData.match_id,
            match_time: streamData.match_time,
            pushurl1: streamData.pushurl1,
            pushurl2: streamData.pushurl2 || ''
          });
          insertCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing video stream ${streamData.match_id}:`, error.message);
      }
    }

    console.log(`✅ Video streams sync completed: ${insertCount} new, ${updateCount} updated`);
    
  } catch (error) {
    console.error('❌ Video streams synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi 30 phút để đồng bộ video streams
const videoStreamCronJob = cron.schedule('*/30 * * * *', syncVideoStreams, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeVideoStreamCron = async () => {
  try {
    const count = await VideoStream.countDocuments();
    if (count === 0) {
      console.log('🎥 No video streams found, running initial sync...');
      await syncVideoStreams();
    } else {
      console.log(`🎥 Found ${count} video streams in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    videoStreamCronJob.start();
    console.log('🎥 Video stream cron job scheduled (every 30 minutes)');
  } catch (error) {
    console.error('❌ Error initializing video stream cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    videoStreamCronJob.start();
    console.log('🎥 Video stream cron job scheduled (every 30 minutes)');
  }
};

module.exports = {
  videoStreamCronJob,
  syncVideoStreams,
  initializeVideoStreamCron
};
