// src/routes/coupons.js
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
    ctx.body = { error: "Coupon not found" };
    return;
  }

  // 檢查折價券是否已失效
  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate || !coupon.isActive) {
    ctx.status = 400;
    ctx.body = { error: "Coupon is not valid or has expired" };
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
    ctx.body = { error: "Coupon not found" };
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
    ctx.body = { error: "Coupon not found" };
    return;
  }

  coupon.isActive = false;
  await coupon.save();
  ctx.body = { message: "Coupon disabled successfully", coupon };
});

module.exports = router;
