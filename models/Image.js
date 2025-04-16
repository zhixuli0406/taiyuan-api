// src/models/Image.js
const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 圖片名稱
  url: { type: String, required: true }, // 圖片的雲端儲存 URL 或本地檔案路徑
  description: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Image", imageSchema);