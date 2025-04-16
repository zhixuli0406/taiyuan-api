// src/config/initAdmin.js
const Admin = require("../models/Admin");

// 檢查是否已有管理員存在
const initAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const admin = new Admin({
        email: process.env.ADMIN_EMAIL || "admin@example.com",
        password: process.env.ADMIN_PASSWORD || "admin123",
        name: "系統管理員",
        role: "SuperAdmin"
      });
      await admin.save();
      console.log("管理員帳號已建立");
    }
  } catch (error) {
    console.error("初始化管理員時發生錯誤:", error);
  }
};

module.exports = initAdmin;