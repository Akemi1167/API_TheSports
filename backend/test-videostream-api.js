/**
 * Test videoStream API to see if it's working
 */

const axios = require('axios');

const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

async function testVideoStreamAPI() {
  try {
    console.log('🎥 Testing videoStream API...');
    
    const url = `${API_CONFIG.baseURL}/video/play/stream/list`;
    console.log(`🔗 API URL: ${url}`);
    console.log(`📋 Parameters:`, { user: API_CONFIG.user, secret: API_CONFIG.secret });
    
    const response = await axios.get(url, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });
    
    console.log(`✅ API Response Status: ${response.status}`);
    console.log(`📊 Response Data:`, JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.results) {
      const videoStreams = response.data.results;
      console.log(`📺 Found ${videoStreams.length} video streams`);
      
      if (videoStreams.length > 0) {
        console.log('🔍 Sample video streams:');
        videoStreams.slice(0, 3).forEach((stream, index) => {
          console.log(`   ${index + 1}. Match ID: ${stream.match_id}, Sport: ${stream.sport_id}, ${stream.home} vs ${stream.away}`);
        });
      }
    } else {
      console.log('❌ No results in API response');
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    if (error.response) {
      console.error(`📡 API Response Status: ${error.response.status}`);
      console.error(`📡 API Response Data:`, error.response.data);
    }
  }
}

testVideoStreamAPI();
