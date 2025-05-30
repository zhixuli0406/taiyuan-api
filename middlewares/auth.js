// src/middlewares/auth.js
const exemptRoutes = ["/admin/login"]; 
const jwt = require("jsonwebtoken");

const ensureAdminAuth = async (ctx, next) => {
  // 如果是 OPTIONS 請求，直接放行
  if (ctx.method === 'OPTIONS') {
    return next();
  }

  // 檢查是否為豁免路由
  if (exemptRoutes.includes(ctx.path)) {
    return next();
  }

  // 檢查 token 等認證邏輯
  const token = ctx.headers.authorization?.split(' ')[1];
  if (!token) {
    ctx.status = 403;
    ctx.body = { error: "No token provided" };
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded._id || !decoded.role) {
      ctx.status = 403;
      ctx.body = { error: "Invalid token" };
      return;
    }

    // 檢查角色是否有效
    if (!["SuperAdmin", "Admin"].includes(decoded.role)) {
      ctx.status = 403;
      ctx.body = { error: "Invalid role" };
      return;
    }

    ctx.state.admin = decoded; // 儲存到 ctx.state
    await next();
  } catch (error) {
    console.error("Token verification error:", error);
    ctx.status = 403;
    ctx.body = { error: "Invalid token" };
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