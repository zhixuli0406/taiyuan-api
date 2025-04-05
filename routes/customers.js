// src/routes/customers.js

/**
 * @openapi
 * tags:
 *   name: Customers
 *   description: 客戶管理的 API
 */

/**
 * @openapi
 * /customers:
 *   get:
 *     tags: [Customers]
 *     summary: 獲取客戶列表
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 分頁頁碼
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 50
 *         description: 每頁數量
 *     responses:
 *       200:
 *         description: 成功獲取客戶列表
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
 *                       user_id:
 *                         type: string
 *                         description: Auth0 用戶ID
 *                       email:
 *                         type: string
 *                       email_verified:
 *                         type: boolean
 *                       name:
 *                         type: string
 *                       nickname:
 *                         type: string
 *                       picture:
 *                         type: string
 *                       identities:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             access_token:
 *                               type: string
 *                             connection:
 *                               type: string
 *                             user_id:
 *                               type: string
 *                             provider:
 *                               type: string
 *                             isSocial:
 *                               type: boolean
 *                       family_name:
 *                         type: string
 *                       given_name:
 *                         type: string
 *                       statusMessage:
 *                         type: string
 *                       last_login:
 *                         type: string
 *                         format: date-time
 *                       last_ip:
 *                         type: string
 *                       logins_count:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                   description: 總用戶數
 *                 page:
 *                   type: integer
 *                   description: 當前頁碼
 *                 per_page:
 *                   type: integer
 *                   description: 每頁數量
 *       403:
 *         description: 權限不足
 */

/**
 * @openapi
 * /customers:
 *   post:
 *     tags: [Customers]
 *     summary: 創建新客戶
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
 *         description: 客戶創建成功
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
 *         description: 請求參數錯誤
 *       403:
 *         description: 權限不足
 */

/**
 * @openapi
 * /customers/sync:
 *   post:
 *     tags: [Customers]
 *     summary: 同步 Auth0 用戶到本地資料庫
 *     responses:
 *       200:
 *         description: 同步成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 用戶同步完成
 *                 count:
 *                   type: integer
 *                   description: 同步的用戶數量
 *       403:
 *         description: 權限不足
 *       500:
 *         description: 同步失敗
 */

/**
 * @openapi
 * /customers/me:
 *   get:
 *     tags: [Customers]
 *     summary: 獲取當前登入客戶信息
 *     responses:
 *       200:
 *         description: 成功獲取客戶信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     email_verified:
 *                       type: boolean
 *                     name:
 *                       type: string
 *                     nickname:
 *                       type: string
 *                     picture:
 *                       type: string
 *                     identities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           access_token:
 *                             type: string
 *                           connection:
 *                             type: string
 *                           user_id:
 *                             type: string
 *                           provider:
 *                             type: string
 *                           isSocial:
 *                             type: boolean
 *                     statusMessage:
 *                       type: string
 *                     last_login:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: 未經授權
 *       404:
 *         description: 用戶不存在
 */

const Router = require("koa-router");
const Customer = require("../models/Customer");
const axios = require("axios");

const router = new Router();

// 使用者的 Auth0 管理員 API 訪問 token
const getManagementAPIToken = async () => {
  try {
    const domain = process.env.AUTH0_DOMAIN;
    
    const response = await axios.post(`https://${domain}/oauth/token`, {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${domain}/api/v2/`,
      grant_type: "client_credentials",
    });

    if (!response.data.access_token) {
      throw new Error('未收到有效的存取權杖');
    }

    return response.data.access_token;
  } catch (error) {
    console.error('取得 Management API Token 失敗:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error('驗證失敗：無法取得 Management API 存取權杖');
  }
};

// 獲取客戶列表 (GET /customers)
router.get("/customers", async (ctx) => {
  try {
    // 分頁參數
    const page = parseInt(ctx.query.page) || 0;
    const per_page = parseInt(ctx.query.per_page) || 50;

    // 從本地資料庫獲取用戶列表
    const customers = await Customer.find()
      .skip(page * per_page)
      .limit(per_page)
      .sort({ updated_at: -1 });

    const total = await Customer.countDocuments();

    ctx.body = { 
      customers,
      total,
      page,
      per_page
    };
  } catch (error) {
    ctx.status = error.response?.status || 500;
    ctx.body = {
      error: '取得使用者列表失敗',
      message: error.message
    };
  }
});

// 同步 Auth0 用戶到本地資料庫
router.post("/customers/sync", async (ctx) => {
  try {
    const managementToken = await getManagementAPIToken();
    const domain = process.env.AUTH0_DOMAIN;

    // 從 Auth0 獲取用戶列表
    const response = await axios.get(`https://${domain}/api/v2/users`, {
      headers: {
        Authorization: `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    });

    // 更新本地資料庫
    for (const user of response.data) {
      await Customer.findOneAndUpdate(
        { user_id: user.user_id },
        user,
        { upsert: true, new: true }
      );
    }

    ctx.body = { 
      message: '用戶同步完成',
      count: response.data.length
    };
  } catch (error) {
    ctx.status = error.response?.status || 500;
    ctx.body = {
      error: '同步用戶失敗',
      message: error.message
    };
  }
});

// 獲取當前登入客戶信息 (GET /customers/me)
router.get("/customers/me", async (ctx) => {
  try {
    const auth0User = ctx.state.user;
    if (!auth0User) {
      ctx.status = 401;
      ctx.body = {
        error: '未經授權',
        message: '請先登入系統'
      };
      return;
    }

    // 從本地資料庫獲取用戶資料
    const user = await Customer.findOne({ user_id: auth0User.sub });
    if (!user) {
      ctx.status = 404;
      ctx.body = {
        error: '找不到用戶',
        message: '用戶資料不存在'
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