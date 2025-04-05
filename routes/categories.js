// src/routes/categories.js

/**
 * @openapi
 * tags:
 *   name: Categories
 *   description: 管理分類的 API
 */

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: 獲取分類列表
 *     responses:
 *       200:
 *         description: 成功獲取分類列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *   post:
 *     tags: [Categories]
 *     summary: 新增分類
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentCategory:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: 成功創建分類
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 */

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: 根據 ID 獲取單一分類
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 分類的 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功獲取分類
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: 分類未找到
 *   put:
 *     tags: [Categories]
 *     summary: 更新分類
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 分類的 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentCategory:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: 成功更新分類
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: 分類未找到
 *   delete:
 *     tags: [Categories]
 *     summary: 刪除分類
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 分類的 ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 成功刪除分類
 *       404:
 *         description: 分類未找到
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         parentCategory:
 *           type: string
 *         isActive:
 *           type: boolean
 *         order:
 *           type: number
 */

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
    ctx.body = { error: '分類未找到' };
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
    ctx.body = { error: '無效的父分類 ID' };
    return;
  }

  const parent = parentCategory ? await Category.findById(parentCategory) : null;
  if (parentCategory && !parent) {
    ctx.status = 404;
    ctx.body = { error: '父分類未找到' };
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
    ctx.body = { error: '分類未找到' };
    return;
  }

  // 如果設置了新的父分類，檢查它是否存在
  if (parentCategory) {
    if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
      ctx.status = 400;
      ctx.body = { error: '無效的父分類 ID' };
      return;
    }
    const parent = await Category.findById(parentCategory);
    if (!parent) {
      ctx.status = 404;
      ctx.body = { error: '父分類未找到' };
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
    ctx.body = { error: '分類未找到' };
    return;
  }

  // 檢查分類是否還有子分類
  const hasSubCategories = await Category.exists({ parentCategory: id });
  if (hasSubCategories) {
    ctx.status = 400;
    ctx.body = { error: '無法刪除有子分類的分類' };
    return;
  }

  // 檢查是否有產品使用此分類
  const Product = require('../models/Product');
  const productsUsingCategory = await Product.exists({ category: id });
  if (productsUsingCategory) {
    ctx.status = 400;
    ctx.body = { error: '無法刪除已被產品使用的分類' };
    return;
  }

  await category.deleteOne();
  ctx.status = 204;
});

module.exports = router;