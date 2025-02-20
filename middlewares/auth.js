// src/middlewares/auth.js
const exemptRoutes = ["/admin/login"]; 
const jwt = require("jsonwebtoken");

const ensureAdminAuth = async (ctx, next) => {
  const token = ctx.headers.authorization?.split(" ")[1];

  if (exemptRoutes.includes(ctx.path)) {
    await next();
    return;
  }
  
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: "No authorization token provided" };
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ctx.state.admin = decoded; // 儲存到 ctx.state
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { error: "Invalid or expired token" ,fullError: error};
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