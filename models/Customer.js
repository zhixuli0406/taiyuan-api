// src/models/Customer.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// 定義用戶群組的 enum
const GROUPS = ['default', 'VIP', 'enterprise'];

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, default: '' },
  group: { type: String, enum: GROUPS, default: 'default' },
  address: { type: String, default: '' },
  isActive: { type: Boolean, default: true }, // 是否啟用
}, { timestamps: true });

// 在儲存用戶之前，進行密碼哈希處理
customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 確認用戶輸入密碼是否正確的方法
customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);