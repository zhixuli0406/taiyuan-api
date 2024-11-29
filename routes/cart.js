// src/routes/cart.js

const Router = require('koa-router');
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = new Router();

// Middleware: 確保用戶已登入
const ensureAuth = async (ctx, next) => {
  if (!ctx.state.user) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized' };
    return;
  }
  await next();
};

// 獲取當前用戶的購物車 (GET /cart)
router.get('/cart', ensureAuth, async (ctx) => {
  const userId = ctx.state.user._id;
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    ctx.body = { cart: { items: [] } }; // 空購物車
    return;
  }
  ctx.body = { cart };
});

// 添加產品到購物車 (POST /cart)
router.post('/cart', ensureAuth, async (ctx) => {
  const userId = ctx.state.user._id;
  const { productId, quantity, customFields } = ctx.request.body; // 從請求中獲取數據

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid product ID' };
    return;
  }

  // 確保產品存在
  const product = await Product.findById(productId);
  if (!product) {
    ctx.status = 404;
    ctx.body = { error: 'Product not found' };
    return;
  }

  // 找到或建立購物車
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  // 檢查產品是否已經在購物車中
  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

  if (itemIndex > -1) {
    // 如果已存在，更新數量
    cart.items[itemIndex].quantity += quantity;
  } else {
    // 如果不存在，新增為新項目
    cart.items.push({ product: productId, quantity, customFields });
  }

  await cart.save();
  ctx.body = { message: 'Product added to cart', cart };
});

// 更新購物車中的產品數量 (PUT /cart)
router.put('/cart', ensureAuth, async (ctx) => {
  const userId = ctx.state.user._id;
  const { productId, quantity } = ctx.request.body;

  if (!mongoose.Types.ObjectId.isValid(productId) || quantity < 1) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid product ID or quantity' };
    return;
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    ctx.status = 404;
    ctx.body = { error: 'Cart not found' };
    return;
  }

  // 查找產品並更新數量
  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    ctx.body = { message: 'Product quantity updated', cart };
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Product not in cart' };
  }
});

// 移除購物車中的產品 (DELETE /cart/:productId)
router.delete('/cart/:productId', ensureAuth, async (ctx) => {
  const userId = ctx.state.user._id;
  const { productId } = ctx.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid product ID' };
    return;
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    ctx.status = 404;
    ctx.body = { error: 'Cart not found' };
    return;
  }

  // 移除產品項目
  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();
  ctx.body = { message: 'Product removed from cart', cart };
});

// 清空購物車 (DELETE /cart)
router.delete('/cart', ensureAuth, async (ctx) => {
  const userId = ctx.state.user._id;
  const cart = await Cart.findOne({ user: userId });

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  ctx.body = { message: 'Cart cleared', cart };
});

module.exports = router;