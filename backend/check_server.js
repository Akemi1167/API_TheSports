const axios = require('axios');

async function checkServer() {
    try {
        console.log('🔍 Checking if server is running...');
        
        // Simple health check
        const response = await axios.get('http://localhost:5000/api/venues', {
            timeout: 5000
        });
        
        console.log('✅ Server is running');
        console.log('📊 Status:', response.status);
        console.log('📄 Venues count:', response.data.results?.length || 0);
        
        // Now test sync endpoint
        console.log('\n🧪 Testing venue sync...');
        const syncResponse = await axios.post('http://localhost:5000/api/venues/sync', {}, {
            timeout: 120000 // 2 minutes
        });
        
        console.log('✅ Sync completed:', syncResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('🔌 Code:', error.code);
        
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📄 Data:', error.response.data);
        }
    }
}

checkServer();
