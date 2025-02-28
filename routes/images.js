// src/routes/images.js
const Router = require("koa-router");
const { upload, uploadImageToS3 } = require("../middlewares/upload");
const Image = require("../models/Image");

const router = new Router();

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

router.get("/images", async (ctx) => {
  const { category, search } = ctx.query;

  const filters = {};
  if (category) filters.category = category;
  if (search) filters.title = new RegExp(search, "i");

  const images = await Image.find(filters).sort({ createdAt: -1 });
  ctx.body = { images };
});

router.delete("/images/:id", async (ctx) => {
  const { id } = ctx.params;

  const image = await Image.findById(id);
  if (!image) {
    ctx.status = 404;
    ctx.body = { error: "Image not found" };
    return;
  }

  // 可以選擇從 S3 刪除圖片（可選功能）

  await image.deleteOne();
  ctx.body = { message: "Image deleted successfully" };
});

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
