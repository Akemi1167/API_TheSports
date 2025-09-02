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
    
    let page = 1;
    let totalFetched = 0;
    let allCompetitions = [];
    
    // Xoá toàn bộ dữ liệu cũ trước khi bắt đầu
    await Competition.deleteMany({});
    console.log('🗑️ Cleared all existing competition data');
    
    // Set để theo dõi IDs đã thấy để tránh duplicates
    const seenIds = new Set();
    
    // Lặp qua các trang cho đến khi không còn dữ liệu mới
    while (true) {
      try {
        console.log(`📄 Fetching page ${page}...`);
        
        // Gọi API để lấy dữ liệu competitions cho trang hiện tại
        const response = await axios.get(`${API_CONFIG.baseURL}/football/competition/additional/list`, {
          params: {
            user: API_CONFIG.user,
            secret: API_CONFIG.secret,
            page: page
          },
          timeout: 30000
        });

        const competitions = response.data.results || [];
        console.log(`📡 Fetched ${competitions.length} competitions from page ${page}`);
        
        // Nếu không có dữ liệu thì kết thúc vòng lặp
        if (competitions.length === 0) {
          console.log(`ℹ️ No more data found on page ${page}, ending pagination`);
          break;
        }
        
        // Kiểm tra nếu tất cả IDs đều đã thấy trước đó (duplicate page)
        const newCompetitions = competitions.filter(competition => !seenIds.has(competition.id));
        
        if (newCompetitions.length === 0) {
          console.log(`ℹ️ All ${competitions.length} competitions on page ${page} are duplicates, ending pagination`);
          break;
        }
        
        // Thêm new IDs vào Set để tracking
        newCompetitions.forEach(competition => seenIds.add(competition.id));
        
        // Thêm chỉ dữ liệu mới vào database
        if (newCompetitions.length > 0) {
          await Competition.insertMany(newCompetitions);
          allCompetitions = allCompetitions.concat(newCompetitions);
          totalFetched += newCompetitions.length;
        }
        
        console.log(`✅ Page ${page} processed: ${newCompetitions.length} new competitions added (${competitions.length - newCompetitions.length} duplicates skipped)`);
        
        // Nếu ít hơn dữ liệu mới so với total, có thể là trang cuối
        if (newCompetitions.length < competitions.length * 0.5) {
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

    console.log(`✅ Competitions sync completed: ${totalFetched} total records from ${page - 1} pages`);
    
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
