const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // 產品 ID
  quantity: { type: Number, required: true, min: 1 }, // 數量
  customFields: { type: Map, of: String }, // 可客製化欄位 (key-value 結構)
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // 直接關聯到用戶
  items: [cartItemSchema], // 多個購物項目
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);