const cron = require('node-cron');
const axios = require('axios');
const Stage = require('../models/stage');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu stages
const syncStages = async () => {
  try {
    console.log('🏁 Starting stages synchronization...');
    
    // Gọi API để lấy dữ liệu stages
    const response = await axios.get(`${API_CONFIG.baseURL}/football/stage/list`, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });

    const stages = response.data.results || [];
    console.log(`📡 Fetched ${stages.length} stages from API`);

    // Xoá toàn bộ dữ liệu cũ và insert mới
    await Stage.deleteMany({});
    
    if (stages.length > 0) {
      await Stage.insertMany(stages);
    }

    console.log(`✅ Stages sync completed: ${stages.length} records updated`);
    
  } catch (error) {
    console.error('❌ Stages synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 02:30
const stageCronJob = cron.schedule('30 2 * * *', syncStages, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeStageCron = async () => {
  try {
    const count = await Stage.countDocuments();
    if (count === 0) {
      console.log('🏁 No stages found, running initial sync...');
      await syncStages();
    } else {
      console.log(`🏁 Found ${count} stages in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    stageCronJob.start();
    console.log('🏁 Stage cron job scheduled (runs daily at 02:30)');
  } catch (error) {
    console.error('❌ Error initializing stage cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    stageCronJob.start();
    console.log('🏁 Stage cron job scheduled (runs daily at 02:30)');
  }
};

module.exports = {
  stageCronJob,
  syncStages,
  initializeStageCron
};
