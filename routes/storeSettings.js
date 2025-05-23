const Router = require("koa-router");
const StoreSetting = require("../models/StoreSetting");
const { generatePresignedUrl, deleteImageFromS3 } = require("../middlewares/upload");

const router = new Router();

/**
 * @openapi
 * tags:
 *   name: StoreSetting
 *   description: 商店設置管理 API
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     StoreSetting:
 *       type: object
 *       properties:
 *         storeName:
 *           type: string
 *           description: 商店名稱
 *         description:
 *           type: string
 *           description: 商店描述
 *         contact:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *               description: 聯繫電話
 *             email:
 *               type: string
 *               description: 聯繫郵箱
 *         address:
 *           type: object
 *           properties:
 *             country:
 *               type: string
 *               description: 國家
 *             city:
 *               type: string
 *               description: 城市
 *             district:
 *               type: string
 *               description: 行政區
 *             addressLine:
 *               type: string
 *               description: 詳細地址
 *             postalCode:
 *               type: string
 *               description: 郵遞區號
 *         businessHours:
 *           type: object
 *           properties:
 *             openTime:
 *               type: string
 *             closeTime:
 *               type: string
 *         branding:
 *           type: object
 *           properties:
 *             logoUrl:
 *               type: string
 *               description: 商店 Logo URL
 *             primaryColor:
 *               type: string
 *               description: 主色調
 *         socialMedia:
 *           type: object
 *           properties:
 *             facebook:
 *               type: string
 *               description: Facebook 連結
 *             line:
 *               type: string
 *               description: Line 連結
 *             x:
 *               type: string
 *               description: X (Twitter) 連結
 *             instagram:
 *               type: string
 *               description: Instagram 連結
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 創建時間
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 */

/**
 * @openapi
 * /store-settings:
 *   get:
 *     tags: [StoreSetting]
 *     summary: 讀取商店設置
 *     description: 獲取商店的所有設置信息
 *     responses:
 *       200:
 *         description: 成功獲取商店設置
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreSetting'
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
 */
router.get("/store-settings", async (ctx) => {
  try {
    const settings = await StoreSetting.findOne();
    if (!settings) {
      ctx.status = 404;
      ctx.body = { error: "商店設置未找到" };
      return;
    }
    ctx.body = settings;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "伺服器錯誤" };
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
        // 确保嵌套对象存在
        if (!settings[key]) {
          settings[key] = {};
        }
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
    if (settings.branding.logoUrl) {
      const oldLogoKey = settings.branding.logoUrl.replace(process.env.CLOUD_FRONT_URL, '');
      await deleteImageFromS3(oldLogoKey);
    }

    // 更新商店設定中的 Logo URL
    settings.branding.logoUrl = imageUrl;
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
