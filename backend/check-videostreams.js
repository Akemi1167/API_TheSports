/**
 * Check videoStream collection content
 */

const mongoose = require('mongoose');
const VideoStream = require('./src/models/videoStream');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/api_thesports';

async function checkVideoStreams() {
  try {
    console.log('🚀 Checking videoStream collection...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check total count
    const totalCount = await VideoStream.countDocuments();
    console.log(`📊 Total videoStream records: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('❌ No videoStream records found. Collection is empty.');
      return;
    }
    
    // Check sport_id distribution
    const sportIds = await VideoStream.aggregate([
      { $group: { _id: '$sport_id', count: { $sum: 1 } } }
    ]);
    console.log('🏃‍♂️ Sport ID distribution:', sportIds);
    
    // Check recent records
    const recent = await VideoStream.find()
      .sort({ created_at: -1 })
      .limit(5)
      .select('match_id sport_id match_time home away comp');
    
    console.log('📋 Recent videoStream records:');
    recent.forEach(stream => {
      const matchDate = new Date(stream.match_time * 1000).toISOString();
      console.log(`   - ID: ${stream.match_id}, Sport: ${stream.sport_id}, Time: ${matchDate}, ${stream.home} vs ${stream.away}`);
    });
    
    // Check time range for football matches
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
    const twentyFourHoursFromNow = now + (24 * 60 * 60);
    
    const footballInRange = await VideoStream.find({
      sport_id: 1,
      match_time: {
        $gte: thirtyDaysAgo,
        $lte: twentyFourHoursFromNow
      }
    }).countDocuments();
    
    console.log(`⚽ Football matches in last 30 days + next 24 hours: ${footballInRange}`);
    
    // Check all football matches regardless of time
    const allFootball = await VideoStream.find({ sport_id: 1 }).countDocuments();
    console.log(`⚽ Total football matches (all time): ${allFootball}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Disconnected from MongoDB');
  }
}

checkVideoStreams();
