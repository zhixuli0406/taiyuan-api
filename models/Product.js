// src/models/Product.js
const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 屬性名稱（例如顏色、尺碼）
  price: { type: Number, required: true }, // 專屬價格
  quantity: { type: Number, required: true }, // 專屬庫存
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // 商品名稱
    description: { type: String }, // 商品描述
    price: { type: Number, required: true }, // 基本價格
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // 分類
    categoryName: { type: String }, // 分類名稱
    images: [{ type: String }], // 圖片 URL 列表
    variants: [variantSchema], // 屬性變體
    isCustomizable: { type: Boolean, default: false }, // 是否支援客製化
    customizableFields: [{ type: String }], // 可配置欄位（例如留言）
    stock: { type: Number, default: 0 }, // 總庫存
    transport: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Transport" 
    }], // 支援的運送方式
    isFeatured: { type: Boolean, default: false }, // 是否為熱門商品
    isActive: { type: Boolean, default: true }, // 是否啟用
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);