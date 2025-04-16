// src/routes/carousel.js

/**
 * @openapi
 * tags:
 *   name: Carousels
 *   description: 輪播圖管理的 API
 */

/**
 * @openapi
 * /carousel:
 *   post:
 *     tags: [Carousels]
 *     summary: 創建新的輪播圖
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 description: 輪播圖標題
 *               description:
 *                 type: string
 *                 description: 輪播圖描述
 *               link:
 *                 type: string
 *                 description: 輪播圖連結
 *               order:
 *                 type: number
 *                 description: 顯示順序
 *               image:
 *                 type: string
 *                 description: Base64 格式的圖片
 *     responses:
 *       200:
 *         description: 輪播圖創建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 carousel:
 *                   $ref: '#/components/schemas/Carousel'
 *       400:
 *         description: 請求參數錯誤
 */

/**
 * @openapi
 * /carousels:
 *   get:
 *     tags: [Carousels]
 *     summary: 獲取所有輪播圖列表
 *     responses:
 *       200:
 *         description: 成功獲取輪播圖列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 carousels:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Carousel'
 */

/**
 * @openapi
 * /carousel/{id}:
 *   put:
 *     tags: [Carousels]
 *     summary: 更新輪播圖
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 輪播圖的 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 輪播圖標題
 *               description:
 *                 type: string
 *                 description: 輪播圖描述
 *               link:
 *                 type: string
 *                 description: 輪播圖連結
 *               order:
 *                 type: number
 *                 description: 顯示順序
 *               isActive:
 *                 type: boolean
 *                 description: 是否啟用
 *     responses:
 *       200:
 *         description: 輪播圖更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 carousel:
 *                   $ref: '#/components/schemas/Carousel'
 *       404:
 *         description: 輪播圖未找到
 */

/**
 * @openapi
 * /carousel/{id}:
 *   delete:
 *     tags: [Carousels]
 *     summary: 刪除輪播圖
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 輪播圖的 ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 輪播圖刪除成功
 *       404:
 *         description: 輪播圖未找到
 */

/**
 * @openapi
 * /carousel/presigned-url:
 *   get:
 *     tags: [Carousels]
 *     summary: 獲取輪播圖上傳用的預簽名 URL
 *     description: |
 *       生成用於直接上傳圖片到 S3 的預簽名 URL。
 *       注意：上傳時需要包含返回的 headers。
 *     parameters:
 *       - name: fileType
 *         in: query
 *         required: true
 *         description: 文件類型，必須是 .jpg、.jpeg、.png 或 .gif
 *         schema:
 *           type: string
 *           enum: ['.jpg', '.jpeg', '.png', '.gif']
 *           example: '.jpg'
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
 *                   description: 用於上傳的預簽名 URL
 *                   example: "https://s3.amazonaws.com/bucket/..."
 *                 imageUrl:
 *                   type: string
 *                   description: 上傳完成後的圖片訪問 URL
 *                   example: "https://cdn.example.com/carousels/image.jpg"
 *                 headers:
 *                   type: object
 *                   description: 上傳時需要的 headers
 *                   properties:
 *                     'Content-Type':
 *                       type: string
 *                       example: "image/jpeg"
 *                     'x-amz-acl':
 *                       type: string
 *                       example: "public-read"
 *       400:
 *         description: 不支持的文件類型
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "不支持的文件類型"
 *       500:
 *         description: 生成預簽名 URL 失敗
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "生成預簽名 URL 失敗"
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Carousel:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         link:
 *           type: string
 *         imageUrl:
 *           type: string
 *         order:
 *           type: number
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const Router = require("koa-router");
const Carousel = require("../models/Carousel");
const { upload } = require("../middlewares/upload");
const { uploadBase64ImageToS3, generatePresignedUrl } = require("../middlewares/upload");

const router = new Router();

// 添加圖片驗證中間件
const validateImage = async (ctx, next) => {
  const { image } = ctx.request.body;
  
  if (image) {
    // 檢查 base64 字串格式
    if (!image.match(/^data:image\/(jpeg|png|gif);base64,/)) {
      ctx.status = 400;
      ctx.body = { error: "無效的圖片格式" };
      return;
    }

    // 檢查圖片大小 (例如限制為 5MB)
    const sizeInBytes = Buffer.from(image.split(',')[1], 'base64').length;
    if (sizeInBytes > 5 * 1024 * 1024) {
      ctx.status = 400;
      ctx.body = { error: "圖片大小超過限制" };
      return;
    }
  }

  await next();
};

// 獲取預簽名 URL
router.get("/carousel/presigned-url", async (ctx) => {
  const { fileType } = ctx.query;
  
  // 驗證文件類型
  if (!fileType.match(/\.(jpg|jpeg|png|gif)$/i)) {
    ctx.status = 400;
    ctx.body = { error: "不支持的文件類型" };
    return;
  }

  try {
    const urls = await generatePresignedUrl("carousels", fileType);
    ctx.body = urls;
  } catch (error) {
    console.error('Error handling presigned URL request:', {
      error: error.message,
      fileType,
      stack: error.stack
    });

    ctx.status = 500;
    ctx.body = { 
      error: "生成預簽名 URL 失敗",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
});

// 修改創建輪播圖的路由，使用 imageUrl 而不是 base64 圖片
router.post("/carousel", async (ctx) => {
  const { title, description, link, order, imageUrl } = ctx.request.body;
  
  // 驗證 imageUrl 是否來自允許的 domain
  if (imageUrl && !imageUrl.startsWith(process.env.CLOUD_FRONT_URL)) {
    ctx.status = 400;
    ctx.body = { error: "無效的圖片 URL" };
    return;
  }

  const newCarousel = new Carousel({
    title,
    description,
    imageUrl,
    link,
    order,
  });

  await newCarousel.save();
  ctx.body = {
    message: "Carousel created successfully",
    carousel: newCarousel,
  };
});

// 獲取所有輪播圖列表 (GET /carousel)
router.get("/carousel", async (ctx) => {
  const carousels = await Carousel.find({ isActive: true }).sort({ order: 1 });
  ctx.body = { carousels };
});

// 修改更新輪播圖的路由
router.put("/carousel/:id", async (ctx) => {
  const { id } = ctx.params;
  const { title, description, link, order, isActive, imageUrl } = ctx.request.body;

  const carousel = await Carousel.findById(id);
  if (!carousel) {
    ctx.status = 404;
    ctx.body = { error: "輪播圖未找到" };
    return;
  }

  // 驗證 imageUrl 是否來自允許的 domain
  if (imageUrl && !imageUrl.startsWith(process.env.CLOUD_FRONT_URL)) {
    ctx.status = 400;
    ctx.body = { error: "無效的圖片 URL" };
    return;
  }

  // 更新字段
  carousel.title = title ?? carousel.title;
  carousel.description = description ?? carousel.description;
  carousel.link = link ?? carousel.link;
  carousel.order = order ?? carousel.order;
  carousel.isActive = isActive ?? carousel.isActive;
  carousel.imageUrl = imageUrl ?? carousel.imageUrl;

  await carousel.save();
  ctx.body = { message: "Carousel updated successfully", carousel };
});

// 刪除輪播圖 (DELETE /carousel/:id)
router.delete("/carousel/:id", async (ctx) => {
  const { id } = ctx.params;

  const carousel = await Carousel.findById(id);
  if (!carousel) {
    ctx.status = 404;
    ctx.body = { error: "輪播圖未找到" };
    return;
  }

  await carousel.deleteOne();
  ctx.body = { message: "Carousel deleted successfully" };
});

module.exports = router;
