// src/routes/customers.js
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