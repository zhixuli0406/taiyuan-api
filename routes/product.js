// src/routes/products.js
const Router = require("koa-router");
const Product = require("../models/Product");
const Category = require("../models/Category");
const { uploadBase64ImageToS3 } = require("../middlewares/upload");

const router = new Router();

// 創建產品 (POST /products)
router.post("/products", async (ctx) => {
  const {
    name,
    description,
    price,
    category,
    images,
    variants,
    isCustomizable,
    customizableFields,
    stock,
    transport,
    isFeatured,
  } = ctx.request.body;

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
    variants,
    isCustomizable,
    customizableFields,
    stock,
    transport,
    isFeatured,
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

  const uploadedImages = [];
  if (images && images.length > 0) {
    for (const base64 of images) {
      const imageUrl = await uploadBase64ImageToS3(base64, "products");
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
  product.images = [...product.images, ...uploadedImages];
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
