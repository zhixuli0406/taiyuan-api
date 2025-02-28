// src/models/Image.js
const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // 圖片名稱
    url: { type: String, required: true }, // 圖片的雲端存儲 URL 或本地文件路徑
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);