const categoryService = require('../services/categoryService');

// GET /api/categories - Lấy tất cả categories
const getAllCategories = async (req, res) => {
  const result = await categoryService.getAllCategories();
  
  if (result.success) {
    res.json({
      code: 200,
      results: result.data
    });
  } else {
    res.status(500).json({
      code: 500,
      message: result.error
    });
  }
};

// GET /api/categories/:id - Lấy category theo ID
const getCategoryById = async (req, res) => {
  const result = await categoryService.getCategoryById(req.params.id);
  
  if (result.success) {
    res.json({
      code: 200,
      result: result.data
    });
  } else {
    const statusCode = result.statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: result.error
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById
};
