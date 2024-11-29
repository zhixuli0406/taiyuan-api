// src/routes/admin.js

const Router = require("koa-router");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

const router = new Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// 管理員登入 (POST /admin/login)
router.post("/admin/login", async (ctx) => {
  const { email, password } = ctx.request.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    ctx.status = 401;
    ctx.body = { error: "Invalid email or password" };
    return;
  }

  // 驗證密碼
  const isPasswordMatch = await admin.matchPassword(password);
  if (!isPasswordMatch) {
    ctx.status = 401;
    ctx.body = { error: "Invalid email or password" };
    return;
  }

  // 簽發 JWT
  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    JWT_SECRET,
    { expiresIn: "1d" } // Token 有效期為 1 天
  );

  ctx.body = { message: "Login successful", token };
});

// 創建新管理員 (POST /admin)
router.post("/admin", async (ctx) => {
  const { username, email, password, role } = ctx.request.body;

  // 確認角色有效性
  if (role && !["SuperAdmin", "Admin"].includes(role)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid role" };
    return;
  }

  try {
    const newAdmin = new Admin({
      username,
      email,
      password,
      role: role || "Admin",
    });

    await newAdmin.save();

    ctx.body = { message: "Admin created successfully", admin: newAdmin };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
});

// 獲取管理員列表 (GET /admin)
router.get("/admin", async (ctx) => {
  const admins = await Admin.find({}, "-password"); // 避免返回密碼欄位
  ctx.body = { admins };
});

// 更新管理員資料 (PUT /admin/:id)
router.put("/admin/:id", async (ctx) => {
  const { id } = ctx.params;
  const { username, email, role } = ctx.request.body;

  if (role && !["SuperAdmin", "Admin"].includes(role)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid role" };
    return;
  }

  const admin = await Admin.findById(id);
  if (!admin) {
    ctx.status = 404;
    ctx.body = { error: "Admin not found" };
    return;
  }

  admin.username = username || admin.username;
  admin.email = email || admin.email;
  admin.role = role || admin.role;

  await admin.save();
  ctx.body = { message: "Admin updated successfully", admin };
});

// 更新管理員資料 (PUT /admin/:id)
router.put("/admin/:id", async (ctx) => {
  const { id } = ctx.params;
  const { username, email, role } = ctx.request.body;

  if (role && !["SuperAdmin", "Admin"].includes(role)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid role" };
    return;
  }

  const admin = await Admin.findById(id);
  if (!admin) {
    ctx.status = 404;
    ctx.body = { error: "Admin not found" };
    return;
  }

  admin.username = username || admin.username;
  admin.email = email || admin.email;
  admin.role = role || admin.role;

  await admin.save();
  ctx.body = { message: "Admin updated successfully", admin };
});

module.exports = router;
