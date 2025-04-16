const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // 運送方式名稱
    fee: { type: Number, required: true }, // 運送費用
    description: { type: String }, // 運送方式描述
    estimatedDays: { type: Number }, // 預計運送天數
    isActive: { type: Boolean, default: true }, // 是否啟用
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 創建者
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // 更新者
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transport", transportSchema); 