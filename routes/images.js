// src/routes/images.js
const Router = require("koa-router");
const { upload, uploadImageToS3, listImagesFromS3, deleteImageFromS3, generatePresignedUrl } = require("../middlewares/upload");
const Image = require("../models/Image");
const Product = require("../models/Product");
const Carousel = require("../models/Carousel");
const StoreSetting = require("../models/StoreSetting");

const router = new Router();

/**
 * @openapi
 * tags:
 *   - name: Images
 *     description: 圖片管理 API
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Image:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: 圖片的 CloudFront URL
 *         key:
 *           type: string
 *           description: 圖片在 S3 中的 key
 */

/**
 * @openapi
 * /images/presigned-url:
 *   get:
 *     tags: [Images]
 *     summary: 獲取圖片上傳用的預簽名 URL
 *     description: 生成用於直接上傳圖片到 S3 的預簽名 URL
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
 *                   example: "https://cdn.example.com/images/image.jpg"
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
router.get("/images/presigned-url", async (ctx) => {
  const { fileType } = ctx.query;
  
  // 驗證文件類型
  if (!fileType.match(/\.(jpg|jpeg|png|gif)$/i)) {
    ctx.status = 400;
    ctx.body = { error: "不支持的文件類型" };
    return;
  }

  try {
    const urls = await generatePresignedUrl("images", fileType);
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

/**
 * @openapi
 * /images:
 *   get:
 *     tags: [Images]
 *     summary: 獲取圖片列表
 *     description: 從 S3 獲取所有圖片並返回 CloudFront URL
 *     responses:
 *       200:
 *         description: 成功獲取圖片列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 images:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Image'
 *       500:
 *         description: 伺服器錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "獲取圖片列表失敗"
 */
router.get("/images", async (ctx) => {
  try {
    const images = await listImagesFromS3();
    ctx.body = { images };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "獲取圖片列表失敗" };
  }
});

/**
 * @openapi
 * /images/{key}:
 *   delete:
 *     tags: [Images]
 *     summary: 刪除圖片
 *     description: |
 *       從 S3 中刪除指定圖片。
 *       在刪除之前會檢查該圖片是否被其他資料庫（如產品、輪播圖、商店設置等）使用。
 *       如果圖片正在被使用，將返回錯誤信息並列出使用該圖片的資料庫。
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         description: 圖片在 S3 中的 key，例如 'images/example.jpg'
 *         schema:
 *           type: string
 *           example: "images/example.jpg"
 *     responses:
 *       200:
 *         description: 圖片刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 成功消息
 *                   example: "圖片刪除成功"
 *       400:
 *         description: 圖片正在被使用
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 錯誤信息
 *                   example: "圖片正在被使用，無法刪除"
 *                 usedBy:
 *                   type: array
 *                   description: 使用該圖片的資料庫列表
 *                   items:
 *                     type: string
 *                     enum: [products, carousels, storeSettings]
 *                   example: ["products", "carousels"]
 *       404:
 *         description: 圖片未找到
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 錯誤信息
 *                   example: "圖片未找到"
 *       500:
 *         description: 伺服器錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 錯誤信息
 *                   example: "刪除圖片失敗"
 */
router.delete("/images/:key", async (ctx) => {
  const { key } = ctx.params;
  const imageUrl = `${process.env.CLOUD_FRONT_URL}${key}`;
  
  try {
    // 檢查圖片是否被產品使用
    const productsUsingImage = await Product.find({ images: imageUrl });
    
    // 檢查圖片是否被輪播圖使用
    const carouselsUsingImage = await Carousel.find({ imageUrl });
    
    // 檢查圖片是否被商店設置使用
    const storeSettingsUsingImage = await StoreSetting.findOne({ 
      'appearance.logo': imageUrl 
    });
    
    // 收集所有使用此圖片的資料庫
    const usedBy = [];
    if (productsUsingImage.length > 0) usedBy.push('products');
    if (carouselsUsingImage.length > 0) usedBy.push('carousels');
    if (storeSettingsUsingImage) usedBy.push('storeSettings');
    
    // 如果圖片正在被使用，返回錯誤
    if (usedBy.length > 0) {
      ctx.status = 400;
      ctx.body = {
        error: "圖片正在被使用，無法刪除",
        usedBy
      };
      return;
    }
    
    // 如果圖片未被使用，執行刪除操作
    const success = await deleteImageFromS3(key);
    if (!success) {
      ctx.status = 404;
      ctx.body = { error: "圖片未找到" };
      return;
    }
    
    ctx.body = { message: "圖片刪除成功" };
  } catch (error) {
    console.error('刪除圖片時發生錯誤:', error);
    ctx.status = 500;
    ctx.body = { error: "刪除圖片失敗" };
  }
});

/**
 * @openapi
 * /images/{id}:
 *   put:
 *     tags: [Images]
 *     summary: 更新圖片信息
 *     description: 更新圖片的標題和描述
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 圖片的 ID
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
 *                 description: 圖片標題
 *               description:
 *                 type: string
 *                 description: 圖片描述
 *     responses:
 *       200:
 *         description: 圖片更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image updated successfully"
 *                 image:
 *                   $ref: '#/components/schemas/Image'
 *       404:
 *         description: 圖片未找到
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Image not found"
 */
router.put("/images/:id", async (ctx) => {
  const { id } = ctx.params;
  const { title, description } = ctx.request.body;

  const image = await Image.findById(id);
  if (!image) {
    ctx.status = 404;
    ctx.body = { error: "Image not found" };
    return;
  }

  image.title = title ?? image.title;
  image.description = description ?? image.description;

  await image.save();
  ctx.body = { message: "Image updated successfully", image };
});

module.exports = router;
