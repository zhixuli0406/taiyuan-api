// src/models/Carousel.js
const mongoose = require("mongoose");

const carouselSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 輪播圖標題
  description: { type: String },          // 輪播圖描述
  imageUrl: { type: String, required: true }, // 圖片 URL
  link: { type: String },                  // 點擊後跳轉的連結
  order: { type: Number, default: 0 },        // 顯示順序
  isActive: { type: Boolean, default: true }, // 是否啟用
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Carousel", carouselSchema);