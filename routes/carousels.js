// src/routes/carousel.js
const Router = require("koa-router");
const Carousel = require("../models/Carousel");
const { upload } = require("../middlewares/upload");

const router = new Router();

// 創建新的輪播圖 (POST /carousel)
router.post("/carousel", upload.single("image"), async (ctx) => {
  const { title, description, link, order } = ctx.request.body;
  const imageUrl = ctx.file.location; // S3 上的圖片 URL

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

// 更新輪播圖 (PUT /carousel/:id)
router.put("/carousel/:id", async (ctx) => {
  const { id } = ctx.params;
  const { title, description, link, order, isActive } = ctx.request.body;

  const carousel = await Carousel.findById(id);
  if (!carousel) {
    ctx.status = 404;
    ctx.body = { error: "Carousel not found" };
    return;
  }

  // 更新字段
  carousel.title = title ?? carousel.title;
  carousel.description = description ?? carousel.description;
  carousel.link = link ?? carousel.link;
  carousel.order = order ?? carousel.order;
  carousel.isActive = isActive ?? carousel.isActive;

  await carousel.save();
  ctx.body = { message: "Carousel updated successfully", carousel };
});

// 刪除輪播圖 (DELETE /carousel/:id)
router.delete("/carousel/:id", async (ctx) => {
  const { id } = ctx.params;

  const carousel = await Carousel.findById(id);
  if (!carousel) {
    ctx.status = 404;
    ctx.body = { error: "Carousel not found" };
    return;
  }

  await carousel.deleteOne();
  ctx.body = { message: "Carousel deleted successfully" };
});

module.exports = router;
