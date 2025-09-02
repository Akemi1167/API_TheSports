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
    
    let page = 1;
    let totalFetched = 0;
    let allReferees = [];
    
    // Xoá toàn bộ dữ liệu cũ trước khi bắt đầu
    await Referee.deleteMany({});
    console.log('🗑️ Cleared all existing referee data');
    
    // Set để theo dõi IDs đã thấy để tránh duplicates
    const seenIds = new Set();
    
    // Lặp qua các trang cho đến khi không còn dữ liệu mới
    while (true) {
      try {
        console.log(`📄 Fetching page ${page}...`);
        
        // Gọi API để lấy dữ liệu referees cho trang hiện tại
        const response = await axios.get(`${API_CONFIG.baseURL}/football/referee/list`, {
          params: {
            user: API_CONFIG.user,
            secret: API_CONFIG.secret,
            page: page
          },
          timeout: 30000
        });

        const referees = response.data.results || [];
        console.log(`📡 Fetched ${referees.length} referees from page ${page}`);
        
        // Nếu không có dữ liệu thì kết thúc vòng lặp
        if (referees.length === 0) {
          console.log(`ℹ️ No more data found on page ${page}, ending pagination`);
          break;
        }
        
        // Kiểm tra nếu tất cả IDs đều đã thấy trước đó (duplicate page)
        const newReferees = referees.filter(referee => !seenIds.has(referee.id));
        
        if (newReferees.length === 0) {
          console.log(`ℹ️ All ${referees.length} referees on page ${page} are duplicates, ending pagination`);
          break;
        }
        
        // Thêm new IDs vào Set để tracking
        newReferees.forEach(referee => seenIds.add(referee.id));
        
        // Thêm chỉ dữ liệu mới vào database
        if (newReferees.length > 0) {
          await Referee.insertMany(newReferees);
          allReferees = allReferees.concat(newReferees);
          totalFetched += newReferees.length;
        }
        
        console.log(`✅ Page ${page} processed: ${newReferees.length} new referees added (${referees.length - newReferees.length} duplicates skipped)`);
        
        // Nếu ít hơn dữ liệu mới so với total, có thể là trang cuối
        if (newReferees.length < referees.length * 0.5) {
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

    console.log(`✅ Referees sync completed: ${totalFetched} total records from ${page - 1} pages`);
    
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
