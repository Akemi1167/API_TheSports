const mongoose = require('mongoose');
const Country = require('./src/models/country');

async function clearCountries() {
  try {
    // Kết nối MongoDB
    await mongoose.connect('mongodb://localhost:27017/thesports', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Xóa tất cả countries
    const result = await Country.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} countries`);

    // Kiểm tra lại
    const count = await Country.countDocuments();
    console.log(`📊 Countries remaining: ${count}`);

    await mongoose.disconnect();
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearCountries();
