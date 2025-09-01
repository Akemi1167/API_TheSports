const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    description: 'Category id'
  },
  name: {
    type: String,
    required: true,
    description: 'Category Name'
  },
  updated_at: {
    type: Number,
    required: true,
    description: 'Update time (timestamp)'
  }
});

module.exports = mongoose.model('Category', CategorySchema);
