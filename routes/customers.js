// src/routes/customers.js

/**
 * @openapi
 * tags:
 *   name: Customers
 *   description: 客户管理的 API
 */

/**
 * @openapi
 * /customers:
 *   get:
 *     tags: [Customers]
 *     summary: 获取客户列表
 *     responses:
 *       200:
 *         description: 成功获取客户列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *       403:
 *         description: 权限不足
 */

/**
 * @openapi
 * /customers:
 *   post:
 *     tags: [Customers]
 *     summary: 创建新客户
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: 客户创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 */

/**
 * @openapi
 * /customers/me:
 *   get:
 *     tags: [Customers]
 *     summary: 获取当前登录客户信息
 *     responses:
 *       200:
 *         description: 成功获取客户信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       403:
 *         description: 权限不足
 */

const Router = require("koa-router");
const axios = require("axios");

const router = new Router();

// 使用者的 Auth0 管理員 API 訪問 token
const getManagementAPIToken = async () => {
  const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
    grant_type: "client_credentials",
  });

  return response.data.access_token;
};

// 獲取客戶列表 (GET /customers)
router.get("/customers", async (ctx) => {
  const managementToken = await getManagementAPIToken();

  const response = await axios.get(`https://${process.env.AUTH0_DOMAIN}/api/v2/users`, {
    headers: {
      Authorization: `Bearer ${managementToken}`,
    },
  });

  ctx.body = { customers: response.data };
});

// 創建新客戶 (POST /customers)
router.post("/customers", async (ctx) => {
  const managementToken = await getManagementAPIToken();
  const { email, password, name } = ctx.request.body;

  const response = await axios.post(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
    {
      email,
      password,
      name,
      connection: "Username-Password-Authentication",
    },
    {
      headers: {
        Authorization: `Bearer ${managementToken}`,
      },
    }
  );

  ctx.body = { customer: response.data };
});

// 獲取當前登入客戶信息 (GET /customers/me)
router.get("/customers/me", async (ctx) => {
  const user = ctx.state.user; // 在中介層中設定的解碼後用戶資料
  ctx.body = { user };
});

module.exports = router;