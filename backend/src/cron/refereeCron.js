const cron = require('node-cron');
const axios = require('axios');
const Referee = require('../models/referee');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu referees
const syncReferees = async () => {
  try {
    console.log('👨‍⚖️ Starting referees synchronization...');
    
    // Gọi API để lấy dữ liệu referees
    const response = await axios.get(`${API_CONFIG.baseURL}/football/referee/list`, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });

    const referees = response.data.results || [];
    console.log(`📡 Fetched ${referees.length} referees from API`);

    // Xoá toàn bộ dữ liệu cũ và insert mới
    await Referee.deleteMany({});
    
    if (referees.length > 0) {
      await Referee.insertMany(referees);
    }

    console.log(`✅ Referees sync completed: ${referees.length} records updated`);
    
  } catch (error) {
    console.error('❌ Referees synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 02:00
const refereeCronJob = cron.schedule('0 2 * * *', syncReferees, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeRefereeCron = async () => {
  try {
    const count = await Referee.countDocuments();
    if (count === 0) {
      console.log('👨‍⚖️ No referees found, running initial sync...');
      await syncReferees();
    } else {
      console.log(`👨‍⚖️ Found ${count} referees in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    refereeCronJob.start();
    console.log('👨‍⚖️ Referee cron job scheduled (runs daily at 02:00)');
  } catch (error) {
    console.error('❌ Error initializing referee cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    refereeCronJob.start();
    console.log('👨‍⚖️ Referee cron job scheduled (runs daily at 02:00)');
  }
};

module.exports = {
  refereeCronJob,
  syncReferees,
  initializeRefereeCron
};
