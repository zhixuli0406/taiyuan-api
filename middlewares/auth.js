// src/middlewares/auth.js
const exemptRoutes = ["/admin/login"]; 
const jwt = require("jsonwebtoken");

const ensureAdminAuth = async (ctx, next) => {
  // 如果是 OPTIONS 請求，直接放行
  if (ctx.method === "OPTIONS") {
    return next();
  }

  const token = ctx.headers.authorization?.split(" ")[1];
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: "未提供認證令牌" };
    return;
  }

  try {
    // 檢查 token 等認證邏輯
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "super_admin" && decoded.role !== "admin") {
      ctx.status = 403;
      ctx.body = { error: "權限不足" };
      return;
    }
    ctx.state.admin = decoded; // 儲存到 ctx.state
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: "無效的認證令牌" };
  }
};

const ensureSuperAdmin = async (ctx, next) => {
  if (ctx.state.admin.role !== "SuperAdmin") {
    ctx.status = 403;
    ctx.body = { error: "Access denied" };
    return;
  }
  await next();
};

module.exports = { ensureAdminAuth, ensureSuperAdmin };