// src/routes/categories.js

const Router = require('koa-router');
const mongoose = require('mongoose');
const Category = require('../models/Category');

const router = new Router();

// 獲取分類列表 (GET /categories)
router.get('/categories', async (ctx) => {
  const categories = await Category.find().populate('parentCategory').sort({ order: 1 }).exec();
  ctx.body = { categories };
});

// 根據 ID 獲取單一分類 (GET /categories/:id)
router.get('/categories/:id', async (ctx) => {
  const { id } = ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid category ID' };
    return;
  }

  const category = await Category.findById(id).populate('subCategories').exec();
  if (!category) {
    ctx.status = 404;
    ctx.body = { error: 'Category not found' };
    return;
  }

  ctx.body = { category };
});

// 新增分類 (POST /categories)
router.post('/categories', async (ctx) => {
  const { name, description, parentCategory, isActive, order } = ctx.request.body;

  // 如果設置了父分類，檢查它是否存在
  if (parentCategory && !mongoose.Types.ObjectId.isValid(parentCategory)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid parent category ID' };
    return;
  }

  const parent = parentCategory ? await Category.findById(parentCategory) : null;
  if (parentCategory && !parent) {
    ctx.status = 404;
    ctx.body = { error: 'Parent category not found' };
    return;
  }

  const newCategory = new Category({
    name,
    description,
    parentCategory,
    isActive,
    order,
  });

  await newCategory.save();
  ctx.body = { message: 'Category created', category: newCategory };
});

// 更新分類 (PUT /categories/:id)
router.put('/categories/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, description, parentCategory, isActive, order } = ctx.request.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid category ID' };
    return;
  }

  const category = await Category.findById(id);
  if (!category) {
    ctx.status = 404;
    ctx.body = { error: 'Category not found' };
    return;
  }

  // 如果設置了新的父分類，檢查它是否存在
  if (parentCategory) {
    if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid parent category ID' };
      return;
    }
    const parent = await Category.findById(parentCategory);
    if (!parent) {
      ctx.status = 404;
      ctx.body = { error: 'Parent category not found' };
      return;
    }
  }

  // 更新分類
  category.name = name ?? category.name;
  category.description = description ?? category.description;
  category.parentCategory = parentCategory;
  category.isActive = typeof isActive === 'boolean' ? isActive : category.isActive;
  category.order = order ?? category.order;

  await category.save();
  ctx.body = { message: 'Category updated', category };
});

// 刪除分類 (DELETE /categories/:id)
router.delete('/categories/:id', async (ctx) => {
  const { id } = ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid category ID' };
    return;
  }

  const category = await Category.findById(id);
  if (!category) {
    ctx.status = 404;
    ctx.body = { error: 'Category not found' };
    return;
  }

  // 檢查分類是否還有子分類
  const hasSubCategories = await Category.exists({ parentCategory: id });
  if (hasSubCategories) {
    ctx.status = 400;
    ctx.body = { error: 'Cannot delete category with subcategories' };
    return;
  }

  await category.deleteOne();
  ctx.body = { message: 'Category deleted' };
});

module.exports = router;