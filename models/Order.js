// src/models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  variant: {
    name: String,
    price: Number
  },
  customization: { type: String }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 關聯的使用者
  items: [orderItemSchema], // 訂單中的商品列表
  totalAmount: { type: Number, required: true }, // 訂單總金額
  date: { type: Date, default: Date.now, required: true }, // 訂單日期
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  }, // 訂單狀態
  shippingMethod: {
    type: String,
    enum: ["CVS", "HOME"],  // CVS為便利商店取貨，HOME為宅配
    required: true
  },
  shippingFee: { type: Number, required: true },
  shippingDetails: {
    LogisticsType: { type: String }, // 物流類型
    LogisticsSubType: { type: String }, // 物流子類型
    CVSStoreID: { type: String }, // 便利商店店號
    CVSStoreName: { type: String }, // 便利商店店名
    CVSAddress: { type: String },
    ReceiverName: { type: String },
    ReceiverPhone: { type: String },
    ReceiverEmail: { type: String },
    ReceiverAddress: { type: String },
    TradeNo: { type: String },
    LogisticsID: { type: String },
    BookingNote: { type: String }
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "line_pay", "cvs"],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  paymentDetails: {
    TransactionId: { type: String },
    PaymentNo: { type: String },
    PaymentType: { type: String },
    PaymentDate: { type: Date }
  },
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
