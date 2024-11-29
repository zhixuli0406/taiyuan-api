// src/models/Image.js
const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // 圖片名稱
    description: { type: String }, // 圖片簡介
    url: { type: String, required: true }, // 圖片的雲端存儲 URL 或本地文件路徑
    fileName: { type: String, required: true }, // 文件實際名稱
    width: { type: Number, required: true }, // 圖片寬度
    height: { type: Number, required: true }, // 圖片高度
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);