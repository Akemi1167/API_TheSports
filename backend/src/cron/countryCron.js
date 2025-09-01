const cron = require('node-cron');
const axios = require('axios');
const Country = require('../models/country');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu countries
const syncCountries = async () => {
  try {
    console.log('🌍 Starting countries synchronization...');
    
    // Gọi API để lấy dữ liệu countries
    const response = await axios.get(`${API_CONFIG.baseURL}/football/country/list`, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });

    const countries = response.data.results || [];
    console.log(`📡 Fetched ${countries.length} countries from API`);

    // Xoá toàn bộ dữ liệu cũ và insert mới
    await Country.deleteMany({});
    
    if (countries.length > 0) {
      await Country.insertMany(countries);
    }

    console.log(`✅ Countries sync completed: ${countries.length} records updated`);
    
  } catch (error) {
    console.error('❌ Countries synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 01:10
const countryCronJob = cron.schedule('10 1 * * *', syncCountries, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeCountryCron = async () => {
  try {
    const count = await Country.countDocuments();
    if (count === 0) {
      console.log('🌍 No countries found, running initial sync...');
      await syncCountries();
    } else {
      console.log(`🌍 Found ${count} countries in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    countryCronJob.start();
    console.log('🌍 Country cron job scheduled (runs daily at 01:10)');
  } catch (error) {
    console.error('❌ Error initializing country cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    countryCronJob.start();
    console.log('🌍 Country cron job scheduled (runs daily at 01:10)');
  }
};

module.exports = {
  countryCronJob,
  syncCountries,
  initializeCountryCron
};
