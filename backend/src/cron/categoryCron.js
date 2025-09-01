const cron = require('node-cron');
const axios = require('axios');
const Category = require('../models/category');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu categories
const syncCategories = async () => {
  try {
    console.log('📂 Starting categories synchronization...');
    
    // Gọi API để lấy dữ liệu categories
    const response = await axios.get(`${API_CONFIG.baseURL}/football/category/list`, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });

    const categories = response.data.results || [];
    console.log(`📡 Fetched ${categories.length} categories from API`);

    // Xoá toàn bộ dữ liệu cũ và insert mới
    await Category.deleteMany({});
    
    if (categories.length > 0) {
      await Category.insertMany(categories);
    }

    console.log(`✅ Categories sync completed: ${categories.length} records updated`);
    
  } catch (error) {
    console.error('❌ Categories synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 01:00
const categoryCronJob = cron.schedule('0 1 * * *', syncCategories, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeCategoryCron = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log('📂 No categories found, running initial sync...');
      await syncCategories();
    } else {
      console.log(`📂 Found ${count} categories in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    categoryCronJob.start();
    console.log('📂 Category cron job scheduled (runs daily at 01:00)');
  } catch (error) {
    console.error('❌ Error initializing category cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    categoryCronJob.start();
    console.log('📂 Category cron job scheduled (runs daily at 01:00)');
  }
};

module.exports = {
  categoryCronJob,
  syncCategories,
  initializeCategoryCron
};
