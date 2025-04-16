// src/models/Carousel.js
const mongoose = require("mongoose");

const carouselSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // 圖片標題
    description: { type: String },          // 圖片描述
    imageUrl: { type: String, required: true }, // 圖片的存儲 URL
    link: { type: String, default: "" },        // 點擊圖片時的跳轉網址
    order: { type: Number, default: 0 },        // 排序用
    isActive: { type: Boolean, default: true }, // 是否啟用
  },
  { timestamps: true }
);

module.exports = mongoose.model("Carousel", carouselSchema);