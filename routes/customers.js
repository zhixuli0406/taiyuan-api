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
  try {
    const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: "client_credentials",
    });

    return response.data.access_token;
  } catch (error) {
    console.error('取得 Management API Token 失敗:', error.response?.data || error.message);
    throw new Error('驗證失敗：無法取得 Management API 存取權杖');
  }
};

// 獲取客戶列表 (GET /customers)
router.get("/customers", async (ctx) => {
  try {
    const managementToken = await getManagementAPIToken();

    const response = await axios.get(`https://${process.env.AUTH0_DOMAIN}/api/v2/users`, {
      headers: {
        Authorization: `Bearer ${managementToken}`,
      },
    });

    ctx.body = { customers: response.data };
  } catch (error) {
    ctx.status = error.response?.status || 500;
    ctx.body = {
      error: '取得使用者列表失敗',
      message: error.message
    };
  }
});

// 創建新客戶 (POST /customers)
router.post("/customers", async (ctx) => {
  try {
    const managementToken = await getManagementAPIToken();
    const { email, password, name } = ctx.request.body;

    if (!email || !password || !name) {
      ctx.status = 400;
      ctx.body = {
        error: '缺少必要欄位',
        message: '請提供 email、password 和 name'
      };
      return;
    }

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

    ctx.status = 201;
    ctx.body = { customer: response.data };
  } catch (error) {
    ctx.status = error.response?.status || 500;
    ctx.body = {
      error: '建立使用者失敗',
      message: error.message
    };
  }
});

// 獲取當前登入客戶信息 (GET /customers/me)
router.get("/customers/me", async (ctx) => {
  try {
    const user = ctx.state.user;
    if (!user) {
      ctx.status = 401;
      ctx.body = {
        error: '未經授權',
        message: '請先登入系統'
      };
      return;
    }
    
    ctx.body = { user };
  } catch (error) {
    ctx.status = error.response?.status || 500;
    ctx.body = {
      error: '取得使用者資料失敗',
      message: error.message
    };
  }
});

module.exports = router;