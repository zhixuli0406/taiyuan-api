// src/middlewares/auth.js
const exemptRoutes = ["/admin/login"]; 
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const ensureAdminAuth = async (ctx, next) => {
  const token = ctx.headers.authorization?.split(" ")[1];
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: "No authorization token provided" };
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    ctx.state.admin = decoded; // 儲存到 ctx.state
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { error: "Invalid or expired token" };
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

const checkJwtWithExemption = async (ctx, next) => {
  if (exemptRoutes.includes(ctx.path)) {
    await next(); // 路徑匹配，跳過驗證
    return;
  }

  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.status = 401;
    ctx.body = { error: "No authorization token provided" };
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ctx.state.admin = decoded;
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { error: "Invalid or expired token" };
  }
};

module.exports = { ensureAdminAuth, ensureSuperAdmin, checkJwtWithExemption };