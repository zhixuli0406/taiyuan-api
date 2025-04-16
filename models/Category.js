// src/models/Category.js

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // 指向父分類
  isActive: { type: Boolean, default: true }, // 用於啟用/停用分類
  order: { type: Number, default: 0 }, // 用於排序的欄位
}, { timestamps: true });

// 虛擬欄位用於取得子分類
categorySchema.virtual('subCategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

module.exports = mongoose.model('Category', categorySchema);