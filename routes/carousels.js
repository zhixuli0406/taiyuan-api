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
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               link:
 *                 type: string
 *               order:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
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
 * /carousel:
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
 *               description:
 *                 type: string
 *               link:
 *                 type: string
 *               order:
 *                 type: number
 *               isActive:
 *                 type: boolean
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
 * components:
 *   schemas:
 *     Carousel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         imageUrl:
 *           type: string
 *         link:
 *           type: string
 *         order:
 *           type: number
 *         isActive:
 *           type: boolean
 */

const Router = require("koa-router");
const Carousel = require("../models/Carousel");
const { upload } = require("../middlewares/upload");
const { uploadBase64ImageToS3 } = require("../middlewares/upload");

const router = new Router();

// 創建新的輪播圖 (POST /carousel)
router.post("/carousel", async (ctx) => {
  const { title, description, link, order, image } = ctx.request.body;
  
  let imageUrl = null;
  if (image) {
    console.log('Uploading carousel image starting...');
    imageUrl = await uploadBase64ImageToS3(image, "carousels");
    console.log(imageUrl);
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

// 更新輪播圖 (PUT /carousel/:id)
router.put("/carousel/:id", async (ctx) => {
  const { id } = ctx.params;
  const { title, description, link, order, isActive, image } = ctx.request.body;

  const carousel = await Carousel.findById(id);
  if (!carousel) {
    ctx.status = 404;
    ctx.body = { error: "輪播圖未找到" };
    return;
  }

  let imageUrl = carousel.imageUrl;
  if (image) {
    console.log('Uploading carousel image starting...');
    imageUrl = await uploadBase64ImageToS3(image, "carousels");
    console.log(imageUrl);
  }

  // 更新字段
  carousel.title = title ?? carousel.title;
  carousel.description = description ?? carousel.description;
  carousel.link = link ?? carousel.link;
  carousel.order = order ?? carousel.order;
  carousel.isActive = isActive ?? carousel.isActive;
  carousel.imageUrl = imageUrl;

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
