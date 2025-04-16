// src/models/Admin.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["SuperAdmin", "Admin"]; // 定義角色類型

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ROLES, default: "Admin" }, // 預設為一般管理員
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 密碼雜湊處理
adminSchema.pre("save", async function(next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// 密碼驗證
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);
