// src/routes/products.js

/**
 * @openapi
 * tags:
 *   name: Products
 *   description: 产品管理的 API
 */

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: 创建产品
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
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: number
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
 *       201:
 *         description: 产品创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     category:
 *                       type: string
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: number
 *                     isCustomizable:
 *                       type: boolean
 *                     customizableFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                     stock:
 *                       type: number
 *                     transport:
 *                       type: array
 *                       items:
 *                         type: string
 *                     isFeatured:
 *                       type: boolean
 *       404:
 *         description: 分类未找到
 */

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: 获取产品列表
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: 页码
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         description: 每页产品数量
 *         schema:
 *           type: integer
 *       - name: category
 *         in: query
 *         required: false
 *         description: 分类 ID
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         required: false
 *         description: 产品名称搜索
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取产品列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       category:
 *                         type: string
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       variants:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             price:
 *                               type: number
 *                             quantity:
 *                               type: number
 *                       isCustomizable:
 *                         type: boolean
 *                       customizableFields:
 *                         type: array
 *                         items:
 *                           type: string
 *                       stock:
 *                         type: number
 *                       transport:
 *                         type: array
 *                         items:
 *                           type: string
 *                       isFeatured:
 *                         type: boolean
 *                 total:
 *                   type: integer
 *       404:
 *         description: 未找到产品
 */

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: 获取单一产品
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 产品的 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取产品
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     category:
 *                       type: string
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: number
 *                     isCustomizable:
 *                       type: boolean
 *                     customizableFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                     stock:
 *                       type: number
 *                     transport:
 *                       type: array
 *                       items:
 *                         type: string
 *                     isFeatured:
 *                       type: boolean
 *       404:
 *         description: 产品未找到
 */

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: 更新产品
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 产品的 ID
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
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: number
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
 *         description: 产品更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     category:
 *                       type: string
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: number
 *                     isCustomizable:
 *                       type: boolean
 *                     customizableFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                     stock:
 *                       type: number
 *                     transport:
 *                       type: array
 *                       items:
 *                         type: string
 *                     isFeatured:
 *                       type: boolean
 *       404:
 *         description: 产品未找到
 */

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: 删除产品
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 产品的 ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 产品删除成功
 *       404:
 *         description: 产品未找到
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
 */

const Router = require("koa-router");
const Product = require("../models/Product");
const Category = require("../models/Category");
const { uploadBase64ImageToS3, generatePresignedUrl } = require("../middlewares/upload");

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
router.post("/products", async (ctx) => {
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

  const uploadedImages = [];
  if (images && images.length > 0) {
    for (const base64 of images) {
      console.log('Uploading image starting...');
      const imageUrl = await uploadBase64ImageToS3(base64, "products");
      console.log(imageUrl);
      uploadedImages.push(imageUrl); // 存儲圖片 URL
    }
  }

  const product = new Product({
    name,
    description,
    price,
    category,
    categoryName,
    images: uploadedImages,
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
    .sort({ createdAt: -1 }) // 按創建日期降序
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Product.countDocuments(query);

  ctx.body = { products, total };
});

// 獲取單一產品 (GET /products/:id)
router.get("/products/:id", async (ctx) => {
  const { id } = ctx.params;

  const product = await Product.findById(id).populate("category");
  if (!product) {
    ctx.status = 404;
    ctx.body = { error: "Product not found" };
    return;
  }

  ctx.body = { product };
});

// 更新產品 (PUT /products/:id)
router.put("/products/:id", async (ctx) => {
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

  const uploadedImages = images;
  if (newImages && newImages.length > 0) {
    for (const base64 of newImages) {
      console.log('Uploading image starting...');
      const imageUrl = await uploadBase64ImageToS3(base64, "products");
      console.log(imageUrl);
      uploadedImages.push(imageUrl); // 存儲圖片 URL
    }
  }

  // 更新字段
  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.category = category ?? product.category;
  product.categoryName =
    (await Category.findById(category))?.name ?? product.categoryName;
  product.images = uploadedImages ?? product.images;
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
router.delete("/products/:id", async (ctx) => {
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

module.exports = router;
