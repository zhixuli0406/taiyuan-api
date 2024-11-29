// src/config/initAdmin.js
const Admin = require("../models/Admin");

const initializeAdmin = async () => {
  try {
    // 檢查是否已有管理員存在
    const existingAdmin = await Admin.findOne({ email: "zhixuli0406@gmail.com" });
    if (existingAdmin) {
      console.log("Default admin already exists.");
      return; // 如果已存在，則跳過創建
    }

    // 創建預設管理員
    const defaultAdmin = new Admin({
      username: "admin",
      email: process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com",
      password: process.env.DEFAULT_ADMIN_PASSWORD || "defaultPassword",
      role: "SuperAdmin",
    });

    await defaultAdmin.save();
    console.log("Default admin created successfully.");
  } catch (error) {
    console.error("Error initializing default admin:", error.message);
  }
};

module.exports = initializeAdmin;