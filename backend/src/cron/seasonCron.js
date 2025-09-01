const cron = require('node-cron');
const axios = require('axios');
const Season = require('../models/season');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu seasons
const syncSeasons = async () => {
  try {
    console.log('📅 Starting seasons synchronization...');
    
    // Gọi API để lấy dữ liệu seasons
    const response = await axios.get(`${API_CONFIG.baseURL}/football/season/list`, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });

    const seasons = response.data.results || [];
    console.log(`📡 Fetched ${seasons.length} seasons from API`);

    // Xoá toàn bộ dữ liệu cũ và insert mới
    await Season.deleteMany({});
    
    if (seasons.length > 0) {
      await Season.insertMany(seasons);
    }

    console.log(`✅ Seasons sync completed: ${seasons.length} records updated`);
    
  } catch (error) {
    console.error('❌ Seasons synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 02:20
const seasonCronJob = cron.schedule('20 2 * * *', syncSeasons, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeSeasonCron = async () => {
  try {
    const count = await Season.countDocuments();
    if (count === 0) {
      console.log('📅 No seasons found, running initial sync...');
      await syncSeasons();
    } else {
      console.log(`📅 Found ${count} seasons in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    seasonCronJob.start();
    console.log('📅 Season cron job scheduled (runs daily at 02:20)');
  } catch (error) {
    console.error('❌ Error initializing season cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    seasonCronJob.start();
    console.log('📅 Season cron job scheduled (runs daily at 02:20)');
  }
};

module.exports = {
  seasonCronJob,
  syncSeasons,
  initializeSeasonCron
};
