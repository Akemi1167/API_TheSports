const cron = require('node-cron');
const axios = require('axios');
const Venue = require('../models/venue');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu venues
const syncVenues = async () => {
  try {
    console.log('🏟️ Starting venues synchronization...');
    
    // Gọi API để lấy dữ liệu venues
    const response = await axios.get(`${API_CONFIG.baseURL}/football/venue/list`, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });

    const venues = response.data.results || [];
    console.log(`📡 Fetched ${venues.length} venues from API`);

    // Xoá toàn bộ dữ liệu cũ và insert mới
    await Venue.deleteMany({});
    
    if (venues.length > 0) {
      await Venue.insertMany(venues);
    }

    console.log(`✅ Venues sync completed: ${venues.length} records updated`);
    
  } catch (error) {
    console.error('❌ Venues synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 02:10
const venueCronJob = cron.schedule('10 2 * * *', syncVenues, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeVenueCron = async () => {
  try {
    const count = await Venue.countDocuments();
    if (count === 0) {
      console.log('🏟️ No venues found, running initial sync...');
      await syncVenues();
    } else {
      console.log(`🏟️ Found ${count} venues in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    venueCronJob.start();
    console.log('🏟️ Venue cron job scheduled (runs daily at 02:10)');
  } catch (error) {
    console.error('❌ Error initializing venue cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    venueCronJob.start();
    console.log('🏟️ Venue cron job scheduled (runs daily at 02:10)');
  }
};

module.exports = {
  venueCronJob,
  syncVenues,
  initializeVenueCron
};
