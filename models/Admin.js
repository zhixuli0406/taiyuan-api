// src/models/Admin.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ROLES = ["SuperAdmin", "Admin"]; // 定義角色類型

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "Admin" }, // 預設為普通管理員
  },
  { timestamps: true }
);

// 密碼哈希處理
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 密碼驗證
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);
