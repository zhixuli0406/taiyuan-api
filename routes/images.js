// src/routes/images.js
const Router = require("koa-router");
const { upload, uploadImageToS3, listImagesFromS3, deleteImageFromS3 } = require("../middlewares/upload");
const Image = require("../models/Image");

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
 * /images:
 *   post:
 *     tags: [Images]
 *     summary: 上傳圖片
 *     description: 上傳圖片到 S3 並保存圖片信息
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 圖片文件
 *               title:
 *                 type: string
 *                 description: 圖片標題
 *               description:
 *                 type: string
 *                 description: 圖片描述
 *     responses:
 *       200:
 *         description: 圖片上傳成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image uploaded successfully"
 *                 image:
 *                   $ref: '#/components/schemas/Image'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No image file provided"
 */
router.post("/images", upload.single("image"), async (ctx) => {
  const { title, description } = ctx.request.body;

  if (!ctx.file) {
    ctx.status = 400;
    ctx.body = { error: "No image file provided" };
    return;
  }

  // 上傳圖片到 S3
  const imageUrl = await uploadImageToS3(ctx.file);

  // 保存圖片信息到數據庫
  const newImage = new Image({
    title,
    url: imageUrl,
  });

  await newImage.save();
  ctx.body = { message: "Image uploaded successfully", image: newImage };
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
 *     description: 從 S3 中刪除指定圖片
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         description: 圖片在 S3 中的 key
 *         schema:
 *           type: string
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
 *                   example: "圖片刪除成功"
 *       404:
 *         description: 圖片未找到
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
 *                   example: "刪除圖片失敗"
 */
router.delete("/images/:key", async (ctx) => {
  const { key } = ctx.params;
  
  try {
    const success = await deleteImageFromS3(key);
    if (!success) {
      ctx.status = 404;
      ctx.body = { error: "圖片未找到" };
      return;
    }
    
    ctx.body = { message: "圖片刪除成功" };
  } catch (error) {
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
