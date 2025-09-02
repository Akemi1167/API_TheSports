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
    
    let page = 1;
    let allCountries = [];
    let totalFetched = 0;
    
    // Xoá toàn bộ dữ liệu cũ trước khi bắt đầu
    await Country.deleteMany({});
    console.log('🗑️ Cleared all existing country data');
    
    // Set để theo dõi IDs đã thấy để tránh duplicates
    const seenIds = new Set();
    
    // Lặp qua các trang cho đến khi không còn dữ liệu mới
    while (true) {
      try {
        console.log(`📄 Fetching page ${page}...`);
        
        // Gọi API để lấy dữ liệu countries cho trang hiện tại
        const response = await axios.get(`${API_CONFIG.baseURL}/football/country/list`, {
          params: {
            user: API_CONFIG.user,
            secret: API_CONFIG.secret,
            page: page
          },
          timeout: 30000
        });

        const countries = response.data.results || [];
        console.log(`📡 Fetched ${countries.length} countries from page ${page}`);
        
        // Nếu không có dữ liệu thì kết thúc vòng lặp
        if (countries.length === 0) {
          console.log(`ℹ️ No more data found on page ${page}, ending pagination`);
          break;
        }
        
        // Kiểm tra nếu tất cả IDs đều đã thấy trước đó (duplicate page)
        const newCountries = countries.filter(country => !seenIds.has(country.id));
        
        if (newCountries.length === 0) {
          console.log(`ℹ️ All ${countries.length} countries on page ${page} are duplicates, ending pagination`);
          break;
        }
        
        // Thêm new IDs vào Set để tracking
        newCountries.forEach(country => seenIds.add(country.id));
        
        // Thêm chỉ dữ liệu mới vào database
        if (newCountries.length > 0) {
          await Country.insertMany(newCountries);
          allCountries = allCountries.concat(newCountries);
          totalFetched += newCountries.length;
        }
        
        console.log(`✅ Page ${page} processed: ${newCountries.length} new countries added (${countries.length - newCountries.length} duplicates skipped)`);
        
        // Nếu ít hơn dữ liệu mới so với total, có thể là trang cuối
        if (newCountries.length < countries.length * 0.5) {
          console.log(`ℹ️ Less than 50% new data on page ${page}, likely reaching end of data`);
        }
        
        // Tăng page để lấy trang tiếp theo
        page++;
        
        // Thêm delay nhỏ để tránh spam API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (pageError) {
        console.error(`❌ Error fetching page ${page}:`, pageError.message);
        // Nếu có lỗi ở trang cụ thể, thử trang tiếp theo
        page++;
        
        // Nếu lỗi quá nhiều trang liên tiếp thì dừng
        if (page > 10 && totalFetched === 0) {
          console.error('❌ Too many failed pages, stopping pagination');
          break;
        }
      }
    }

    console.log(`✅ Countries sync completed: ${totalFetched} total records from ${page - 1} pages`);
    
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
