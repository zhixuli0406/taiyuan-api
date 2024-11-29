// src/middlewares/auth.js

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

const checkJwt = async (ctx, next) => {
  const token = ctx.headers.authorization?.split(" ")[1];
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: "No authorization token provided" };
    return;
  }

  // 設定 Auth0 的 JWKS 客戶端
  const client = jwksRsa({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  });

  // Token 驗證邏輯
  const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err);
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  };

  try {
    const decoded = jwt.verify(token, getKey, {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    });

    ctx.state.user = decoded; // 把解碼後的用戶信息保存到 ctx.state
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: "Invalid or expired token" };
  }
};

module.exports = { ensureAdminAuth, ensureSuperAdmin, checkJwt };