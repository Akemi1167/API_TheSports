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
    
    let page = 1;
    let totalFetched = 0;
    let allStages = [];
    
    // Xoá toàn bộ dữ liệu cũ trước khi bắt đầu
    await Stage.deleteMany({});
    console.log('🗑️ Cleared all existing stage data');
    
    // Set để theo dõi IDs đã thấy để tránh duplicates
    const seenIds = new Set();
    
    // Lặp qua các trang cho đến khi không còn dữ liệu mới
    while (true) {
      try {
        console.log(`📄 Fetching page ${page}...`);
        
        // Gọi API để lấy dữ liệu stages cho trang hiện tại
        const response = await axios.get(`${API_CONFIG.baseURL}/football/stage/list`, {
          params: {
            user: API_CONFIG.user,
            secret: API_CONFIG.secret,
            page: page
          },
          timeout: 30000
        });

        const stages = response.data.results || [];
        console.log(`📡 Fetched ${stages.length} stages from page ${page}`);
        
        // Nếu không có dữ liệu thì kết thúc vòng lặp
        if (stages.length === 0) {
          console.log(`ℹ️ No more data found on page ${page}, ending pagination`);
          break;
        }
        
        // Kiểm tra nếu tất cả IDs đều đã thấy trước đó (duplicate page)
        const newStages = stages.filter(stage => !seenIds.has(stage.id));
        
        if (newStages.length === 0) {
          console.log(`ℹ️ All ${stages.length} stages on page ${page} are duplicates, ending pagination`);
          break;
        }
        
        // Thêm new IDs vào Set để tracking
        newStages.forEach(stage => seenIds.add(stage.id));
        
        // Thêm chỉ dữ liệu mới vào database
        if (newStages.length > 0) {
          await Stage.insertMany(newStages);
          allStages = allStages.concat(newStages);
          totalFetched += newStages.length;
        }
        
        console.log(`✅ Page ${page} processed: ${newStages.length} new stages added (${stages.length - newStages.length} duplicates skipped)`);
        
        // Nếu ít hơn dữ liệu mới so với total, có thể là trang cuối
        if (newStages.length < stages.length * 0.5) {
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

    console.log(`✅ Stages sync completed: ${totalFetched} total records from ${page - 1} pages`);
    
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
