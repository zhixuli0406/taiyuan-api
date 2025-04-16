// src/routes/admin.js

/**
 * @openapi
 * tags:
 *   name: Admin
 *   description: 管理員的 API
 */

/**
 * @openapi
 * /admin/login:
 *   post:
 *     tags: [Admin]
 *     summary: 管理員登入
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登入成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       401:
 *         description: 無效的電子郵件或密碼
 */

/**
 * @openapi
 * /admin:
 *   post:
 *     tags: [Admin]
 *     summary: 創建新管理員
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin]
 *     responses:
 *       201:
 *         description: 管理員創建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       400:
 *         description: 無效的角色或其他錯誤
 */

/**
 * @openapi
 * /admin:
 *   get:
 *     tags: [Admin]
 *     summary: 獲取管理員列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取管理員列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admins:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Admin'
 */

/**
 * @openapi
 * /admin/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: 更新管理員資料
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 管理員的 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin]
 *     responses:
 *       200:
 *         description: 管理員更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       404:
 *         description: 管理員未找到
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         role:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const Router = require("koa-router");
const Admin = require("../models/Admin");
const { ensureAdminAuth } = require("../middlewares/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = new Router();

// 管理員登入
router.post('/login', async (ctx) => {
  const { email, password } = ctx.request.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      ctx.status = 401;
      ctx.body = { error: "無效的電子郵件或密碼" };
      return;
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      ctx.status = 401;
      ctx.body = { error: "無效的電子郵件或密碼" };
      return;
    }

    const token = jwt.sign({ _id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    ctx.body = { token, admin };
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: "無效的電子郵件或密碼" };
  }
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

module.exports = router;
