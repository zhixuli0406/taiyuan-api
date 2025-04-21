// src/models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true }, // 折價券代碼
    type: { type: String, enum: ["fixed", "percentage"], required: true }, // 折扣類型
    value: { type: Number, required: true }, // 折扣值（如 100 元或 10%）
    maxDiscount: { type: Number }, // 折扣上限 (當百分比折扣適用)
    minPurchase: { type: Number, default: 0 }, // 最低消費金額限制
    usageLimit: { type: Number, default: 1 }, // 全站限制總使用次數
    usedCount: { type: Number, default: 0 }, // 已使用次數
    applicableToProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // 指定適用產品
    applicableToCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }], // 指定適用分類
    startDate: { type: Date, required: true }, // 有效起始日期
    endDate: { type: Date, required: true }, // 有效結束日期
    isActive: { type: Boolean, default: true }, // 是否啟用
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);