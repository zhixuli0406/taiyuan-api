// src/models/Category.js

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // 指向父分類
  isActive: { type: Boolean, default: true }, // 用於啟用/禁用分類
}, { timestamps: true });

// 虛擬字段用於取得子分類
categorySchema.virtual('subCategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
  justOne: false,
});

module.exports = mongoose.model('Category', categorySchema);