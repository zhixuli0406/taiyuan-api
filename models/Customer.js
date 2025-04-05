// src/models/Customer.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// 定義身份驗證提供者的 enum
const PROVIDERS = ['line', 'google-oauth2', 'email'];

// 定義身份識別 Schema
const identitySchema = new mongoose.Schema({
  access_token: { type: String, required: true },
  connection: { type: String, required: true },
  user_id: { type: String, required: true },
  provider: { type: String, enum: PROVIDERS, required: true },
  isSocial: { type: Boolean, default: true }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  // Auth0 用戶ID
  user_id: { type: String, required: true, unique: true },
  
  // 基本資料
  email: { type: String, sparse: true },
  email_verified: { type: Boolean, default: false },
  name: { type: String, required: true },
  nickname: { type: String },
  picture: { type: String },
  
  // 社交登入相關
  identities: [identitySchema],
  
  // Google OAuth 特定欄位
  family_name: String,
  given_name: String,
  
  // Line 特定欄位
  statusMessage: String,
  
  // 登入相關資訊
  last_login: { type: Date },
  last_ip: { type: String },
  logins_count: { type: Number, default: 0 },
  
  // 系統欄位
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

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

// 更新時自動更新 updated_at
customerSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Customer', customerSchema);