/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: 使用者認證的 API
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: 透過 Auth0 登入取得使用者資訊
 *     tags: [Auth]
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
 *         description: 登入成功，返回 JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: 無效的登入憑證
 *       404:
 *         description: 使用者未找到
 */

const Router = require("koa-router");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = new Router();

// 透過 Auth0 登入取得使用者資訊
router.post("/login", async (ctx) => {
  try {
    const { email, password } = ctx.request.body;

    // 透過 Auth0 驗證
    const user = await User.findOne({ email });
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: "使用者未找到" };
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      ctx.status = 401;
      ctx.body = { error: "無效的電子郵件或密碼" };
      return;
    }

    // JWT 簽署
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    ctx.body = { token };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

module.exports = router;