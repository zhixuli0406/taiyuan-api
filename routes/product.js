// src/routes/products.js

/**
 * @openapi
 * tags:
 *   name: Products
 *   description: 產品管理 API
 */

/**
 * @openapi
 * /products/presigned-url:
 *   get:
 *     tags: [Products]
 *     summary: 獲取產品圖片上傳用的預簽名 URL
 *     parameters:
 *       - name: fileType
 *         in: query
 *         required: true
 *         description: 文件類型 (.jpg, .png, .gif)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功獲取預簽名 URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       400:
 *         description: 不支持的文件類型
 *       500:
 *         description: 生成預簽名 URL 失敗
 */

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: 創建產品
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: 商品名稱
 *               description:
 *                 type: string
 *                 description: 商品描述
 *               price:
 *                 type: number
 *                 description: 基本價格
 *               category:
 *                 type: string
 *                 description: 分類ID
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 圖片URL列表
 *               variants:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Variant'
 *               isCustomizable:
 *                 type: boolean
 *                 description: 是否支持客製化
 *               customizableFields:
 *                 type: array
 *                 items:
 *                   type: string
 *               stock:
 *                 type: number
 *                 description: 總庫存
 *               transport:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 支持的運輸方式ID列表
 *               isFeatured:
 *                 type: boolean
 *                 description: 是否為熱門商品
 *     responses:
 *       200:
 *         description: 產品創建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: 分類未找到
 */

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: 獲取產品列表
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 頁碼
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: 每頁產品數量
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: category
 *         in: query
 *         description: 分類ID
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         description: 產品名稱搜索
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功獲取產品列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 */

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: 獲取單個產品
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功獲取產品
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: 產品未找到
 */

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: 更新產品
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
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
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               newImages:
 *                 type: array
 *                 items:
 *                   type: string
 *               variants:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Variant'
 *               isCustomizable:
 *                 type: boolean
 *               customizableFields:
 *                 type: array
 *                 items:
 *                   type: string
 *               stock:
 *                 type: number
 *               transport:
 *                 type: array
 *                 items:
 *                   type: string
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 產品更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: 產品未找到
 */

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: 刪除產品
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 產品刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: 產品未找到
 */

/**
 * @openapi
 * /products/{id}/transport:
 *   post:
 *     tags: [Products]
 *     summary: 添加運輸方式到產品
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transportId
 *             properties:
 *               transportId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 運輸方式添加成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: 產品或運輸方式未找到
 */

/**
 * @openapi
 * /products/{id}/transport/{transportId}:
 *   delete:
 *     tags: [Products]
 *     summary: 從產品中移除運輸方式
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: transportId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 運輸方式移除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: 產品或運輸方式未找到
 */

/**
 * @openapi
 * /products/{id}/transport:
 *   get:
 *     tags: [Products]
 *     summary: 獲取產品的所有運輸方式
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功獲取運輸方式列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transport:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transport'
 *       404:
 *         description: 產品未找到
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         categoryName:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Variant'
 *         isCustomizable:
 *           type: boolean
 *         customizableFields:
 *           type: array
 *           items:
 *             type: string
 *         stock:
 *           type: number
 *         transport:
 *           type: array
 *           items:
 *             type: string
 *         isFeatured:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Variant:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - quantity
 *       properties:
 *         name:
 *           type: string
 *           description: 屬性名稱（例如顏色、尺碼）
 *         price:
 *           type: number
 *           description: 專屬價格
 *         quantity:
 *           type: number
 *           description: 專屬庫存
 */

const Router = require("koa-router");
const Product = require("../models/Product");
const Category = require("../models/Category");
const { uploadBase64ImageToS3, generatePresignedUrl } = require("../middlewares/upload");
const { ensureAdminAuth } = require("../middlewares/auth");
const Transport = require("../models/Transport");

const router = new Router();

// 獲取預簽名 URL
router.get("/products/presigned-url", async (ctx) => {
  const { fileType } = ctx.query;
  
  if (!fileType.match(/\.(jpg|jpeg|png|gif)$/i)) {
    ctx.status = 400;
    ctx.body = { error: "不支持的文件類型" };
    return;
  }

  try {
    const urls = await generatePresignedUrl("products", fileType);
    ctx.body = urls;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "生成預簽名 URL 失敗" };
  }
});

// 創建產品 (POST /products)
router.post("/products", ensureAdminAuth, async (ctx) => {
  const { name, description, price, category, images, ...rest } = ctx.request.body;

  // 驗證所有圖片 URL
  if (images && Array.isArray(images)) {
    const invalidImages = images.filter(url => !url.startsWith(process.env.CLOUD_FRONT_URL));
    if (invalidImages.length > 0) {
      ctx.status = 400;
      ctx.body = { error: "包含無效的圖片 URL" };
      return;
    }
  }

  // 驗證分類是否存在
  const existingCategory = await Category.findById(category);
  if (!existingCategory) {
    ctx.status = 404;
    ctx.body = { error: "Category not found" };
    return;
  }

  const categoryName = existingCategory.name;

  const product = new Product({
    name,
    description,
    price,
    category,
    categoryName,
    images: images || [], // 直接使用已上傳的圖片 URL
    ...rest,
  });

  await product.save();
  ctx.body = { message: "Product created successfully", product };
});

// 獲取產品列表 (GET /products)
router.get("/products", async (ctx) => {
  // 支持分頁和篩選
  const { page = 1, limit = 10, category, search } = ctx.query;
  const query = {};

  if (category) query.category = category; // 按分類過濾
  if (search) query.name = new RegExp(search, "i"); // 按名稱過濾

  const products = await Product.find(query)
    .populate("category")
    .populate("transport", "name fee") // 添加 transport 的 populate
    .sort({ createdAt: -1 }) // 按創建日期降序
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Product.countDocuments(query);

  ctx.body = { products, total };
});

// 獲取單一產品 (GET /products/:id)
router.get("/products/:id", async (ctx) => {
  const { id } = ctx.params;

  const product = await Product.findById(id)
    .populate("category")
    .populate("transport", "name fee"); // 添加 transport 的 populate

  if (!product) {
    ctx.status = 404;
    ctx.body = { error: "Product not found" };
    return;
  }

  ctx.body = { product };
});

// 更新產品 (PUT /products/:id)
router.put("/products/:id", ensureAdminAuth, async (ctx) => {
  const { id } = ctx.params;
  const {
    name,
    description,
    price,
    category,
    images,
    newImages,
    variants,
    isCustomizable,
    customizableFields,
    stock,
    transport,
    isFeatured,
  } = ctx.request.body;

  const product = await Product.findById(id);
  if (!product) {
    ctx.status = 404;
    ctx.body = { error: "Product not found" };
    return;
  }

  // 更新字段
  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.category = category ?? product.category;
  product.categoryName =
    (await Category.findById(category))?.name ?? product.categoryName;
  product.images = images ?? product.images; // 直接使用已上傳的圖片 URL
  product.variants = variants ?? product.variants;
  product.isCustomizable = isCustomizable ?? product.isCustomizable;
  product.customizableFields = customizableFields ?? product.customizableFields;
  product.stock = stock ?? product.stock;
  product.transport = transport ?? product.transport;
  product.isFeatured = isFeatured ?? product.isFeatured;

  await product.save();
  ctx.body = { message: "Product updated successfully", product };
});

// 刪除產品 (DELETE /products/:id)
router.delete("/products/:id", ensureAdminAuth, async (ctx) => {
  const { id } = ctx.params;

  const product = await Product.findById(id);
  if (!product) {
    ctx.status = 404;
    ctx.body = { error: "Product not found" };
    return;
  }

  await product.deleteOne();
  ctx.body = { message: "Product deleted successfully" };
});

// 添加運輸方式到產品
router.post("/products/:id/transport", ensureAdminAuth, async (ctx) => {
  const { id } = ctx.params;
  const { transportId } = ctx.request.body;

  const product = await Product.findById(id);
  if (!product) {
    ctx.status = 404;
    ctx.body = { error: "Product not found" };
    return;
  }

  const transport = await Transport.findById(transportId);
  if (!transport) {
    ctx.status = 404;
    ctx.body = { error: "Transport method not found" };
    return;
  }

  if (!product.transport.includes(transportId)) {
    product.transport.push(transportId);
    await product.save();
  }

  ctx.body = { message: "Transport method added to product successfully" };
});

// 從產品中移除運輸方式
router.delete("/products/:id/transport/:transportId", ensureAdminAuth, async (ctx) => {
  const { id, transportId } = ctx.params;

  const product = await Product.findById(id);
  if (!product) {
    ctx.status = 404;
    ctx.body = { error: "Product not found" };
    return;
  }

  const transportIndex = product.transport.indexOf(transportId);
  if (transportIndex === -1) {
    ctx.status = 404;
    ctx.body = { error: "Transport method not found in product" };
    return;
  }

  product.transport.splice(transportIndex, 1);
  await product.save();

  ctx.body = { message: "Transport method removed from product successfully" };
});

// 獲取產品的所有運輸方式
router.get("/products/:id/transport", async (ctx) => {
  const { id } = ctx.params;

  const product = await Product.findById(id).populate("transport");
  if (!product) {
    ctx.status = 404;
    ctx.body = { error: "Product not found" };
    return;
  }

  ctx.body = { transport: product.transport };
});

module.exports = router;
