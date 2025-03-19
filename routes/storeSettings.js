const Router = require("koa-router");
const StoreSetting = require("../models/StoreSetting");
const { upload, uploadImageToS3 } = require("../middlewares/upload");

const router = new Router();

/**
 * @openapi
 * /store-settings:
 *   get:
 *     tags:
 *       - Store Settings
 *     summary: 讀取商店設置
 *     responses:
 *       200:
 *         description: 成功獲取商店設置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 settings:
 *                   type: object
 *                   additionalProperties: true
 *       404:
 *         description: 商店設置未找到
 *       500:
 *         description: 伺服器錯誤
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
 * /store-settings/logo:
 *   put:
 *     tags:
 *       - Store Settings
 *     summary: 更新商店 Logo
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
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
 *                 logo:
 *                   type: string
 *       400:
 *         description: 未提供文件
 *       404:
 *         description: 商店設置未找到
 *       500:
 *         description: 伺服器錯誤
 */
router.put("/store-settings/logo", upload.single("logo"), async (ctx) => {
  const file = ctx.file;

  if (!file) {
    ctx.status = 400;
    ctx.body = { error: "No file provided" };
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

    // 如果已經存在舊的 Logo 文件，提取舊文件的 S3 Key 並刪除
    const oldLogoUrl = settings.appearance.logo;
    if (oldLogoUrl) {
      const oldLogoKey = oldLogoUrl.split(".com/")[1]; // 解析文件的 Key
      await deleteFileFromS3(oldLogoKey); // 刪除舊文件
    }

    // 上傳新文件至 S3
    const newLogoUrl = await uploadImageToS3(file, "logos");

    // 更新商店設定中的 Logo URL
    settings.appearance.logo = newLogoUrl;
    await settings.save();

    ctx.body = { message: "Logo updated successfully", logo: newLogoUrl };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

module.exports = router;
