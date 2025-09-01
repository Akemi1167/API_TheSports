const cron = require('node-cron');
const axios = require('axios');
const Competition = require('../models/competition');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu competitions
const syncCompetitions = async () => {
  try {
    console.log('🏆 Starting competitions synchronization...');
    
    // Gọi API để lấy dữ liệu competitions
    const response = await axios.get(`${API_CONFIG.baseURL}/football/competition/additional/list`, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });

    const competitions = response.data.results || [];
    console.log(`📡 Fetched ${competitions.length} competitions from API`);

    // Xoá toàn bộ dữ liệu cũ và insert mới
    await Competition.deleteMany({});
    
    if (competitions.length > 0) {
      await Competition.insertMany(competitions);
    }

    console.log(`✅ Competitions sync completed: ${competitions.length} records updated`);
    
  } catch (error) {
    console.error('❌ Competitions synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 01:20
const competitionCronJob = cron.schedule('20 1 * * *', syncCompetitions, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeCompetitionCron = async () => {
  try {
    const count = await Competition.countDocuments();
    if (count === 0) {
      console.log('🏆 No competitions found, running initial sync...');
      await syncCompetitions();
    } else {
      console.log(`🏆 Found ${count} competitions in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    competitionCronJob.start();
    console.log('🏆 Competition cron job scheduled (runs daily at 01:20)');
  } catch (error) {
    console.error('❌ Error initializing competition cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    competitionCronJob.start();
    console.log('🏆 Competition cron job scheduled (runs daily at 01:20)');
  }
};

module.exports = {
  competitionCronJob,
  syncCompetitions,
  initializeCompetitionCron
};
