const Router = require('koa-router');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

const router = new Router({
  prefix: '/api/auth'
});

// 透過 Auth0 登入取得使用者資訊
router.post('/login', async ctx => {
  const { accessToken } = ctx.request.body;
  try {
    // 通過 Auth0 驗證
    const userInfo = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = await User.findOne({ authId: userInfo.data.sub });
    if (!user) {
      ctx.throw(404, 'User not found');
    }

    // JWT 簽署
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    ctx.body = { token };
  } catch (err) {
    ctx.status = 401;
    ctx.body = { message: 'Invalid login' };
  }
});

module.exports = router;