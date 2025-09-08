/**
 * Script để convert timestamps sang datetime readable
 */

const mongoose = require('mongoose');
const VideoStream = require('./src/models/videoStream');

// Hàm convert timestamp sang readable datetime
const convertTimestamp = (timestamp) => {
  if (!timestamp || timestamp === 0) return 'N/A';
  
  // Convert Unix timestamp (seconds) to Date
  const date = new Date(timestamp * 1000);
  
  // Format theo timezone Việt Nam (UTC+7)
  const options = {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  
  return date.toLocaleString('vi-VN', options);
};

// Hàm convert và hiển thị dữ liệu VideoStream
const convertVideoStreamTimestamps = async () => {
  try {
    console.log('🔍 Fetching VideoStream data...');
    
    const videoStreams = await VideoStream.find({})
      .select('match_id match_time home away comp')
      .sort({ match_time: -1 })
      .limit(20);
    
    console.log(`\n📋 Found ${videoStreams.length} video streams\n`);
    
    console.log('┌─────────────────┬───────────────────────┬─────────────────────────────────────────┐');
    console.log('│ Match ID        │ Datetime (VN)         │ Match Details                           │');
    console.log('├─────────────────┼───────────────────────┼─────────────────────────────────────────┤');
    
    videoStreams.forEach(stream => {
      const datetime = convertTimestamp(stream.match_time);
      const matchInfo = `${stream.home || 'N/A'} vs ${stream.away || 'N/A'}`;
      const comp = stream.comp || 'N/A';
      
      console.log(`│ ${stream.match_id.padEnd(15)} │ ${datetime.padEnd(21)} │ ${(matchInfo + ' (' + comp + ')').padEnd(39)} │`);
    });
    
    console.log('└─────────────────┴───────────────────────┴─────────────────────────────────────────┘');
    
    return videoStreams;
    
  } catch (error) {
    console.error('❌ Error converting VideoStream timestamps:', error.message);
    throw error;
  }
};

// Hàm convert timestamps cho các models khác
const convertOtherTimestamps = async () => {
  try {
    console.log('\n🔍 Checking other models with timestamps...\n');
    
    // Check Season model
    const Season = require('./src/models/season');
    const seasons = await Season.find({}).limit(5);
    
    if (seasons.length > 0) {
      console.log('📅 Season timestamps:');
      seasons.forEach(season => {
        console.log(`- ID: ${season.id}`);
        console.log(`  Start: ${convertTimestamp(season.start_time)}`);
        console.log(`  End: ${convertTimestamp(season.end_time)}`);
        console.log(`  Updated: ${convertTimestamp(season.updated_at)}`);
        console.log('');
      });
    }
    
    // Check Team model
    const Team = require('./src/models/team');
    const teams = await Team.find({}).limit(3);
    
    if (teams.length > 0) {
      console.log('🏈 Team timestamps:');
      teams.forEach(team => {
        console.log(`- ${team.name || team.id}`);
        console.log(`  Foundation: ${convertTimestamp(team.foundation_time)}`);
        console.log(`  Updated: ${convertTimestamp(team.updated_at)}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error converting other timestamps:', error.message);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting timestamp conversion...\n');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/thesports', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Convert VideoStream timestamps
    await convertVideoStreamTimestamps();
    
    // Convert other model timestamps
    await convertOtherTimestamps();
    
    console.log('✅ Timestamp conversion completed!');
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Export các utility functions
module.exports = {
  convertTimestamp,
  convertVideoStreamTimestamps,
  convertOtherTimestamps
};

// Run nếu được gọi trực tiếp
if (require.main === module) {
  main();
}
