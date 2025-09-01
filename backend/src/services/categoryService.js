const Category = require('../models/category');

class CategoryService {
  async getAllCategories() {
    try {
      const categories = await Category.find();
      return {
        success: true,
        data: categories
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCategoryById(id) {
    try {
      const category = await Category.findOne({ id });
      if (!category) {
        return {
          success: false,
          error: 'Category not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: category
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new CategoryService();
