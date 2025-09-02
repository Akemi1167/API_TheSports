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
    
    // Xóa tất cả dữ liệu cũ trước khi sync mới
    console.log('🗑️ Clearing old video stream data...');
    const deleteResult = await VideoStream.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} old video stream records`);
    
    // Gọi API để lấy dữ liệu video streams
    const response = await axios.get(`${API_CONFIG.baseURL}/video/play/stream/list`, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });

    const videoStreams = response.data.results || [];
    console.log(`📡 Fetched ${videoStreams.length} video streams from API`);

    let insertCount = 0;

    // Xử lý từng video stream (chỉ insert vì đã xóa hết)
    for (const streamData of videoStreams) {
      try {
        // Tạo mới video stream
        await VideoStream.create({
          sport_id: streamData.sport_id || 1,
          match_id: streamData.match_id,
          match_time: streamData.match_time || 0,
          match_status: streamData.match_status || 0,
          comp: streamData.comp || '',
          home: streamData.home || '',
          away: streamData.away || '',
          playurl1: streamData.playurl1 || '',
          playurl2: streamData.playurl2 || ''
        });
        insertCount++;
      } catch (error) {
        console.error(`❌ Error processing video stream ${streamData.match_id}:`, error.message);
      }
    }

    console.log(`✅ Video streams sync completed: ${insertCount} new records created`);
    
  } catch (error) {
    console.error('❌ Video streams synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi phút để đồng bộ video streams
const videoStreamCronJob = cron.schedule('* * * * *', syncVideoStreams, {
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
    console.log('🎥 Video stream cron job scheduled (every minute)');
  } catch (error) {
    console.error('❌ Error initializing video stream cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    videoStreamCronJob.start();
    console.log('🎥 Video stream cron job scheduled (every minute)');
  }
};

module.exports = {
  videoStreamCronJob,
  syncVideoStreams,
  initializeVideoStreamCron
};
