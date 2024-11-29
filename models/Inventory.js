// src/models/Inventory.js
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // 關聯商品
    quantity: { type: Number, required: true, default: 0 }, // 現有庫存數量
    safeStock: { type: Number, required: true, default: 10 }, // 安全庫存閾值
    warehouse: { type: String, default: "default" }, // 倉庫的名稱
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);