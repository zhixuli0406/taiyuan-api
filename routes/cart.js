// src/routes/cart.js

/**
 * @openapi
 * tags:
 *   name: Cart
 *   description: 购物车管理的 API
 */

/**
 * @openapi
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: 获取当前用户的购物车
 *     responses:
 *       200:
 *         description: 成功获取购物车
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           customFields:
 *                             type: object
 *       404:
 *         description: 购物车未找到
 */

/**
 * @openapi
 * /cart:
 *   post:
 *     tags: [Cart]
 *     summary: 添加产品到购物车
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               customFields:
 *                 type: object
 *     responses:
 *       201:
 *         description: 产品成功添加到购物车
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           customFields:
 *                             type: object
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 产品未找到
 */

/**
 * @openapi
 * /cart:
 *   put:
 *     tags: [Cart]
 *     summary: 更新购物车中的产品数量
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: 产品数量更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           customFields:
 *                             type: object
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 购物车未找到或产品不在购物车中
 */

/**
 * @openapi
 * /cart/{productId}:
 *   delete:
 *     tags: [Cart]
 *     summary: 移除购物车中的产品
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: 产品的 ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 产品成功移除
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 购物车未找到或产品不在购物车中
 */

/**
 * @openapi
 * /cart:
 *   delete:
 *     tags: [Cart]
 *     summary: 清空购物车
 *     responses:
 *       200:
 *         description: 购物车已清空
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           customFields:
 *                             type: object
 */

const Router = require('koa-router');
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = new Router();

// 獲取當前用戶的購物車 (GET /cart)
router.get('/cart', async (ctx) => {
  const userId = ctx.state.user._id;
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    ctx.body = { cart: { items: [] } }; // 空購物車
    return;
  }
  ctx.body = { cart };
});

// 添加產品到購物車 (POST /cart)
router.post('/cart', async (ctx) => {
  const userId = ctx.state.user._id;
  const { productId, quantity, customFields } = ctx.request.body; // 從請求中獲取數據

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    ctx.status = 400;
    ctx.body = { error: "無效的產品 ID" };
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
router.put('/cart', async (ctx) => {
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
    ctx.body = { error: '購物車未找到' };
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
    ctx.body = { error: '產品不在購物車中' };
  }
});

// 移除購物車中的產品 (DELETE /cart/:productId)
router.delete('/cart/:productId', async (ctx) => {
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
    ctx.body = { error: '購物車未找到' };
    return;
  }

  // 移除產品項目
  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();
  ctx.body = { message: 'Product removed from cart', cart };
});

// 清空購物車 (DELETE /cart)
router.delete('/cart', async (ctx) => {
  const userId = ctx.state.user._id;
  const cart = await Cart.findOne({ user: userId });

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  ctx.body = { message: 'Cart cleared', cart };
});

module.exports = router;