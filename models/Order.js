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
    date: { type: Date, default: Date.now, required: true }, //訂單日期
    status: {
      type: String,
      enum: ["Pending", "Paid", "Shipped", "Completed", "Cancelled"],
      default: "Pending",
    }, // 訂單狀態
    shippingMethod: {
      type: String,
      enum: ["CVS", "HOME"],  // CVS為超商取貨，HOME為宅配
      required: true
    },
    logistics: {
      LogisticsType: { type: String }, // 物流類型
      LogisticsSubType: { type: String }, // 物流子類型
      CVSStoreID: { type: String }, // 超商店號
      CVSStoreName: { type: String }, // 超商店名
      CVSAddress: { type: String }, // 超商地址
      CVSTelephone: { type: String }, // 超商電話
      ReceiverName: { type: String, required: true }, // 收件人姓名
      ReceiverPhone: { type: String, required: true }, // 收件人電話
      ReceiverEmail: { type: String, required: true }, // 收件人信箱
      ReceiverAddress: { type: String }, // 收件人地址(宅配用)
      LogisticsStatus: { type: String }, // 物流狀態
      LogisticsTradeNo: { type: String }, // 物流交易號
    },
    payment: {
      MerchantTradeNo: { type: String }, // 綠界訂單編號
      PaymentType: { type: String }, // 付款方式
      TradeDesc: { type: String }, // 交易描述
      TradeDate: { type: Date }, // 訂單成立時間
      PaymentDate: { type: Date }, // 付款時間
      PaymentTypeChargeFee: { type: Number }, // 交易手續費
      SimulatePaid: { type: Boolean, default: false }, // 是否為模擬付款
      isPaid: { type: Boolean, default: false }, // 是否已支付
    },
    trackingNumber: { type: String }, // 物流追踪號
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
