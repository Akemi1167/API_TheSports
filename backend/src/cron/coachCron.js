const cron = require('node-cron');
const axios = require('axios');
const Coach = require('../models/coach');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu coaches
const syncCoaches = async () => {
  try {
    console.log('🎯 Starting coaches synchronization...');
    
    // Gọi API để lấy dữ liệu coaches
    const response = await axios.get(`${API_CONFIG.baseURL}/football/coach/list`, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });

    const coaches = response.data.results || [];
    console.log(`📡 Fetched ${coaches.length} coaches from API`);

    // Xoá toàn bộ dữ liệu cũ và insert mới
    await Coach.deleteMany({});
    
    if (coaches.length > 0) {
      await Coach.insertMany(coaches);
    }

    console.log(`✅ Coaches sync completed: ${coaches.length} records updated`);
    
  } catch (error) {
    console.error('❌ Coaches synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 01:50
const coachCronJob = cron.schedule('50 1 * * *', syncCoaches, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeCoachCron = async () => {
  try {
    const count = await Coach.countDocuments();
    if (count === 0) {
      console.log('🎯 No coaches found, running initial sync...');
      await syncCoaches();
    } else {
      console.log(`🎯 Found ${count} coaches in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    coachCronJob.start();
    console.log('🎯 Coach cron job scheduled (runs daily at 01:50)');
  } catch (error) {
    console.error('❌ Error initializing coach cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    coachCronJob.start();
    console.log('🎯 Coach cron job scheduled (runs daily at 01:50)');
  }
};

module.exports = {
  coachCronJob,
  syncCoaches,
  initializeCoachCron
};
