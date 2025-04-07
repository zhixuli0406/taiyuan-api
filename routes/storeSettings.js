const Router = require("koa-router");
const StoreSetting = require("../models/StoreSetting");
const { generatePresignedUrl, deleteImageFromS3 } = require("../middlewares/upload");

const router = new Router();

/**
 * @openapi
 * tags:
 *   - name: Store Settings
 *     description: 商店設置管理 API
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     StoreSetting:
 *       type: object
 *       properties:
 *         appearance:
 *           type: object
 *           properties:
 *             logo:
 *               type: string
 *               description: 商店 Logo 的 URL
 *         # 可以根據實際的 StoreSetting model 添加其他屬性
 */

/**
 * @openapi
 * /store-settings:
 *   get:
 *     tags:
 *       - Store Settings
 *     summary: 讀取商店設置
 *     description: 獲取商店的所有設置信息
 *     responses:
 *       200:
 *         description: 成功獲取商店設置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 settings:
 *                   $ref: '#/components/schemas/StoreSetting'
 *       404:
 *         description: 商店設置未找到
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "商店設置未找到"
 *       500:
 *         description: 伺服器錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/store-settings", async (ctx) => {
  try {
    // 查詢第一條商店設置（系統中應只有一條記錄）
    const settings = await StoreSetting.findOne();
    if (!settings) {
      ctx.status = 404;
      ctx.body = { error: "商店設置未找到" };
      return;
    }
    ctx.body = { settings };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

/**
 * @openapi
 * /store-settings:
 *   put:
 *     tags:
 *       - Store Settings
 *     summary: 更新商店設置
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: 商店設置更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 settings:
 *                   type: object
 *                   additionalProperties: true
 *       404:
 *         description: 商店設置未找到
 *       500:
 *         description: 伺服器錯誤
 */
router.put("/store-settings", async (ctx) => {
  const updates = ctx.request.body;

  try {
    const settings = await StoreSetting.findOne();
    if (!settings) {
      ctx.status = 404;
      ctx.body = { error: "商店設置未找到" };
      return;
    }

    // 更新設定
    for (const key in updates) {
      if (updates[key] && typeof updates[key] === "object") {
        for (const subKey in updates[key]) {
          settings[key][subKey] = updates[key][subKey] ?? settings[key][subKey];
        }
      } else {
        settings[key] = updates[key] ?? settings[key];
      }
    }

    await settings.save();

    ctx.body = { message: "Store settings updated successfully", settings };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

/**
 * @openapi
 * /store-settings/logo/presigned-url:
 *   get:
 *     tags:
 *       - Store Settings
 *     summary: 獲取商店 Logo 上傳用的預簽名 URL
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
 *                   example: "https://cdn.example.com/logos/image.jpg"
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
router.get("/store-settings/logo/presigned-url", async (ctx) => {
  const { fileType } = ctx.query;
  
  // 驗證文件類型
  if (!fileType.match(/\.(jpg|jpeg|png|gif)$/i)) {
    ctx.status = 400;
    ctx.body = { error: "不支持的文件類型" };
    return;
  }

  try {
    const urls = await generatePresignedUrl("logos", fileType);
    ctx.body = urls;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "生成預簽名 URL 失敗" };
  }
});

/**
 * @openapi
 * /store-settings/logo:
 *   put:
 *     tags:
 *       - Store Settings
 *     summary: 更新商店 Logo
 *     description: 使用已上傳到 S3 的圖片 URL 更新商店 Logo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: 已上傳到 S3 的圖片 URL
 *                 example: "https://cdn.example.com/logos/image.jpg"
 *     responses:
 *       200:
 *         description: Logo 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logo updated successfully"
 *                 logo:
 *                   type: string
 *                   description: 更新後的 Logo URL
 *                   example: "https://cdn.example.com/logos/image.jpg"
 *       400:
 *         description: 無效的圖片 URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "無效的圖片 URL"
 *       404:
 *         description: 商店設置未找到
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "商店設置未找到"
 *       500:
 *         description: 伺服器錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.put("/store-settings/logo", async (ctx) => {
  const { imageUrl } = ctx.request.body;

  // 驗證 imageUrl 是否來自允許的 domain
  if (!imageUrl || !imageUrl.startsWith(process.env.CLOUD_FRONT_URL)) {
    ctx.status = 400;
    ctx.body = { error: "無效的圖片 URL" };
    return;
  }

  try {
    // 查詢商店當前設置
    const settings = await StoreSetting.findOne();
    if (!settings) {
      ctx.status = 404;
      ctx.body = { error: "商店設置未找到" };
      return;
    }

    // 如果已經存在舊的 Logo，刪除它
    if (settings.appearance.logo) {
      const oldLogoKey = settings.appearance.logo.replace(process.env.CLOUD_FRONT_URL, '');
      await deleteImageFromS3(oldLogoKey);
    }

    // 更新商店設定中的 Logo URL
    settings.appearance.logo = imageUrl;
    await settings.save();

    ctx.body = { 
      message: "Logo updated successfully", 
      logo: imageUrl 
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

module.exports = router;
