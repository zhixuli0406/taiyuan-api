// src/routes/coupons.js

/**
 * @openapi
 * tags:
 *   name: Coupons
 *   description: 折价券管理的 API
 */

/**
 * @openapi
 * /coupons:
 *   post:
 *     tags: [Coupons]
 *     summary: 创建折价券
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [FixedAmount, Percentage]
 *               value:
 *                 type: number
 *               maxDiscount:
 *                 type: number
 *               minPurchase:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               applicableToProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *               applicableToCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *               usageLimit:
 *                 type: number
 *     responses:
 *       201:
 *         description: 折价券创建成功
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
 *         description: 请求参数错误
 */

/**
 * @openapi
 * /coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: 获取所有折价券
 *     responses:
 *       200:
 *         description: 成功获取折价券列表
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
 * /coupons/validate:
 *   post:
 *     tags: [Coupons]
 *     summary: 验证及使用折价券
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               totalAmount:
 *                 type: number
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 折价券验证成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 discount:
 *                   type: number
 *                 finalAmount:
 *                   type: number
 *       400:
 *         description: 折价券无效或不适用
 *       404:
 *         description: 折价券未找到
 */

/**
 * @openapi
 * /coupons/{id}:
 *   delete:
 *     tags: [Coupons]
 *     summary: 删除折价券
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 折价券的 ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 折价券删除成功
 *       404:
 *         description: 折价券未找到
 */

/**
 * @openapi
 * /coupons/{id}/disable:
 *   put:
 *     tags: [Coupons]
 *     summary: 禁用折价券
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 折价券的 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 折价券禁用成功
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
 *         description: 折价券未找到
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         code:
 *           type: string
 *         type:
 *           type: string
 *           enum: [FixedAmount, Percentage]
 *         value:
 *           type: number
 *         maxDiscount:
 *           type: number
 *         minPurchase:
 *           type: number
 *         usageLimit:
 *           type: number
 *         usedCount:
 *           type: number
 *         applicableToProducts:
 *           type: array
 *           items:
 *             type: string
 *         applicableToCategories:
 *           type: array
 *           items:
 *             type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 */

const Router = require("koa-router");
const Coupon = require("../models/Coupon");

const router = new Router();

// Middleware: 確保管理員身份
const ensureAdminAuth = async (ctx, next) => {
  if (!ctx.state.user || !ctx.state.user.isAdmin) {
    ctx.status = 403;
    ctx.body = { error: "Forbidden" };
    return;
  }
  await next();
};

// 創建折價券 (POST /coupons)
router.post("/coupons", ensureAdminAuth, async (ctx) => {
  const {
    code,
    type,
    value,
    maxDiscount,
    minPurchase,
    startDate,
    endDate,
    applicableToProducts,
    applicableToCategories,
    usageLimit,
  } = ctx.request.body;

  try {
    const newCoupon = new Coupon({
      code,
      type,
      value,
      maxDiscount,
      minPurchase,
      startDate,
      endDate,
      applicableToProducts,
      applicableToCategories,
      usageLimit,
    });

    await newCoupon.save();
    ctx.body = { message: "Coupon created successfully", coupon: newCoupon };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
});

// 獲取所有折價券 (GET /coupons)
router.get("/coupons", ensureAdminAuth, async (ctx) => {
  const coupons = await Coupon.find();
  ctx.body = { coupons };
});

// 驗證及使用折價券 (POST /coupons/validate)
router.post("/coupons/validate", async (ctx) => {
  const { code, totalAmount, productIds, categoryIds } = ctx.request.body;

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
  if (totalAmount < coupon.minPurchase) {
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

  // 檢查適用產品或分類
  if (
    coupon.applicableToProducts.length > 0 &&
    !productIds.some((id) => coupon.applicableToProducts.includes(id))
  ) {
    ctx.status = 400;
    ctx.body = { error: "Coupon is not applicable to these products" };
    return;
  }
  if (
    coupon.applicableToCategories.length > 0 &&
    !categoryIds.some((id) => coupon.applicableToCategories.includes(id))
  ) {
    ctx.status = 400;
    ctx.body = { error: "Coupon is not applicable to these categories" };
    return;
  }

  // 計算折扣
  let discount = 0;
  if (coupon.type === "FixedAmount") {
    discount = coupon.value;
  } else if (coupon.type === "Percentage") {
    discount = (totalAmount * coupon.value) / 100;
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
    finalAmount: totalAmount - discount,
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
