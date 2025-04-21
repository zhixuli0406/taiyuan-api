// src/routes/coupons.js

/**
 * @openapi
 * tags:
 *   name: Coupons
 *   description: 折價券管理的 API
 */

/**
 * @openapi
 * /coupons:
 *   post:
 *     tags: [Coupons]
 *     summary: 創建折價券
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - type
 *               - value
 *             properties:
 *               code:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [fixed, percentage]
 *               value:
 *                 type: number
 *               minPurchase:
 *                 type: number
 *               maxDiscount:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               usageLimit:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               applicableToProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *               applicableToCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 折價券創建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 coupon:
 *                   $ref: '#/components/schemas/Coupon'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @openapi
 * /coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: 獲取所有折價券
 *     responses:
 *       200:
 *         description: 成功獲取折價券列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coupons:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Coupon'
 */

/**
 * @openapi
 * /coupons/verify:
 *   post:
 *     tags: [Coupons]
 *     summary: 驗證及使用折價券
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - amount
 *             properties:
 *               code:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: 折價券驗證成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 discount:
 *                   type: number
 *                 coupon:
 *                   $ref: '#/components/schemas/Coupon'
 *       400:
 *         description: 折價券無效或不適用
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: 折價券未找到
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @openapi
 * /coupons/{id}:
 *   delete:
 *     tags: [Coupons]
 *     summary: 刪除折價券
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 折價券的 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 折價券刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: 折價券未找到
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @openapi
 * /coupons/{id}/disable:
 *   put:
 *     tags: [Coupons]
 *     summary: 禁用折價券
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 折價券的 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 折價券禁用成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 coupon:
 *                   $ref: '#/components/schemas/Coupon'
 *       404:
 *         description: 折價券未找到
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         code:
 *           type: string
 *         type:
 *           type: string
 *           enum: [fixed, percentage]
 *         value:
 *           type: number
 *         minPurchase:
 *           type: number
 *         maxDiscount:
 *           type: number
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         usageLimit:
 *           type: number
 *         usedCount:
 *           type: number
 *         isActive:
 *           type: boolean
 *         applicableToProducts:
 *           type: array
 *           items:
 *             type: string
 *         applicableToCategories:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const Router = require("koa-router");
const Coupon = require("../models/Coupon");
const { ensureAdminAuth } = require("../middlewares/auth");

const router = new Router();

// 創建折價券 (POST /coupons)
router.post("/coupons", ensureAdminAuth, async (ctx) => {
  const {
    code,
    type,
    value,
    minPurchase,
    maxDiscount,
    startDate,
    endDate,
    usageLimit,
    isActive,
    applicableToProducts,
    applicableToCategories
  } = ctx.request.body;

  try {
    const newCoupon = new Coupon({
      code,
      type,
      value,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      isActive,
      applicableToProducts,
      applicableToCategories
    });

    await newCoupon.save();
    ctx.body = { message: "Coupon created successfully", coupon: newCoupon };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
});

// 獲取所有折價券 (GET /coupons)
router.get("/coupons", async (ctx) => {
  const coupons = await Coupon.find();
  ctx.body = { coupons };
});

// 驗證及使用折價券 (POST /coupons/verify)
router.post("/coupons/verify", async (ctx) => {
  const { code, amount } = ctx.request.body;

  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    ctx.status = 404;
    ctx.body = { error: "折價券未找到" };
    return;
  }

  // 檢查折價券是否已失效
  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate || !coupon.isActive) {
    ctx.status = 400;
    ctx.body = { error: "折價券無效或不適用" };
    return;
  }

  // 檢查最小消費金額限制
  if (amount < coupon.minPurchase) {
    ctx.status = 400;
    ctx.body = { error: `Minimum purchase amount is ${coupon.minPurchase}` };
    return;
  }

  // 檢查使用次數限制
  if (coupon.usedCount >= coupon.usageLimit) {
    ctx.status = 400;
    ctx.body = { error: "Coupon usage limit reached" };
    return;
  }

  // 計算折扣
  let discount = 0;
  if (coupon.type === "fixed") {
    discount = coupon.value;
  } else if (coupon.type === "percentage") {
    discount = (amount * coupon.value) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }

  // 更新使用次數
  coupon.usedCount += 1;
  await coupon.save();

  ctx.body = {
    message: "Coupon validated successfully",
    discount,
    coupon,
  };
});

// 刪除折價券 (DELETE /coupons/:id)
router.delete("/coupons/:id", ensureAdminAuth, async (ctx) => {
  const { id } = ctx.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    ctx.status = 404;
    ctx.body = { error: "折價券未找到" };
    return;
  }

  await coupon.deleteOne();
  ctx.body = { message: "Coupon deleted successfully" };
});

// 禁用折價券 (PUT /coupons/:id/disable)
router.put("/coupons/:id/disable", ensureAdminAuth, async (ctx) => {
  const { id } = ctx.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    ctx.status = 404;
    ctx.body = { error: "折價券未找到" };
    return;
  }

  coupon.isActive = false;
  await coupon.save();
  ctx.body = { message: "Coupon disabled successfully", coupon };
});

module.exports = router;
