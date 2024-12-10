// src/models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 關聯的用戶
    items: [orderItemSchema], // 訂單中的產品列表
    totalAmount: { type: Number, required: true }, // 訂單總金額
    date: { type: Date, required: true }, //訂單日期
    status: {
      type: String,
      enum: ["Pending", "Paid", "Shipped", "Completed", "Cancelled"],
      default: "Pending",
    }, // 訂單狀態
    shippingMethods: { type: String, required: true }, //訂單配送方式 ex: 超商、宅配
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    }, // 配送地址
    paymentDetails: {
      method: { type: String, default: "Unspecified" },
      isPaid: { type: Boolean, default: false },
      paidAt: { type: Date },
    }, // 支付相關資訊
    trackingNumber: { type: String }, // 物流追踪號
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
