const Router = require("koa-router");
const StoreSetting = require("../models/StoreSetting");
const { upload, uploadImageToS3 } = require("../middlewares/upload");

const router = new Router();

// **讀取商店設置 (GET /store-settings)**
router.get("/store-settings", async (ctx) => {
  try {
    // 查詢第一條商店設置（系統中應只有一條記錄）
    const settings = await StoreSetting.findOne();
    if (!settings) {
      ctx.status = 404;
      ctx.body = { error: "Store settings not found" };
      return;
    }
    ctx.body = { settings };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// **更新商店設置 (PUT /store-settings)**
router.put("/store-settings", async (ctx) => {
  const updates = ctx.request.body;

  try {
    const settings = await StoreSetting.findOne();
    if (!settings) {
      ctx.status = 404;
      ctx.body = { error: "Store settings not found" };
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

// **更新商店 Logo (PUT /store-settings/logo)**，同時刪除舊 Logo 文件
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
      ctx.body = { error: "Store settings not found" };
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
