const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    description: 'Country id'
  },
  category_id: {
    type: String,
    required: true,
    description: 'Category id'
  },
  name: {
    type: String,
    required: true,
    description: 'Country Name'
  },
  logo: {
    type: String,
    required: true,
    description: 'Country logo'
  },
  updated_at: {
    type: Number,
    required: true,
    description: 'Update time (timestamp)'
  }
});

module.exports = mongoose.model('Country', CountrySchema);
