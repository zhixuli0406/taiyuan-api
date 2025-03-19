// src/routes/orders.js

/**
 * @openapi
 * tags:
 *   name: Orders
 *   description: 訂單管理的 API
 */

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: 創建訂單
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: 訂單創建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           price:
 *                             type: number
 *                     totalAmount:
 *                       type: number
 *                     shippingAddress:
 *                       type: object
 *                       properties:
 *                         address:
 *                           type: string
 *                         city:
 *                           type: string
 *                         postalCode:
 *                           type: string
 *                         country:
 *                           type: string
 *       400:
 *         description: 請求參數錯誤
 */

/**
 * @openapi
 * /orders/my-orders:
 *   get:
 *     tags: [Orders]
 *     summary: 查詢用戶訂單
 *     responses:
 *       200:
 *         description: 成功獲取用戶訂單
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: string
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             product:
 *                               type: string
 *                             quantity:
 *                               type: number
 *                             price:
 *                               type: number
 *                       totalAmount:
 *                         type: number
 *                       shippingAddress:
 *                         type: object
 *                         properties:
 *                           address:
 *                             type: string
 *                           city:
 *                             type: string
 *                           postalCode:
 *                             type: string
 *                           country:
 *                             type: string
 *       404:
 *         description: 未找到訂單
 */

/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: 獲取所有訂單 (需要管理員權限)
 *     responses:
 *       200:
 *         description: 成功獲取所有訂單
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: string
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             product:
 *                               type: string
 *                             quantity:
 *                               type: number
 *                             price:
 *                               type: number
 *                       totalAmount:
 *                         type: number
 *                       shippingAddress:
 *                         type: object
 *                         properties:
 *                           address:
 *                             type: string
 *                           city:
 *                             type: string
 *                           postalCode:
 *                             type: string
 *                           country:
 *                             type: string
 *       403:
 *         description: 權限不足
 */

/**
 * @openapi
 * /orders/{id}:
 *   put:
 *     tags: [Orders]
 *     summary: 更新訂單狀態
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 訂單的 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               trackingNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: 訂單更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           price:
 *                             type: number
 *                     totalAmount:
 *                       type: number
 *       404:
 *         description: 訂單未找到
 */

/**
 * @openapi
 * /orders/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: 刪除訂單 (取消)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 訂單的 ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 訂單取消成功
 *       404:
 *         description: 訂單未找到
 *       400:
 *         description: 不能取消非待處理訂單
 */

const Router = require("koa-router");
const Order = require("../models/Order");

const router = new Router();

// 創建訂單
router.post("/orders", async (ctx) => {
  const { userId, items, shippingAddress, paymentMethod } = ctx.request.body;

  // 計算訂單總金額
  let totalAmount = 0;
  items.forEach((item) => {
    totalAmount += item.price * item.quantity;
  });

  // 新增訂單
  const order = new Order({
    user: userId,
    items,
    shippingAddress,
    paymentDetails: { method: paymentMethod },
    totalAmount,
  });

  await order.save();

  ctx.body = { message: "Order created successfully", order };
});

// 查詢用戶訂單
router.get("/orders/my-orders", async (ctx) => {
  const { userId } = ctx.state.user;

  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

  if (!orders.length) {
    ctx.status = 404;
    ctx.body = { error: "No orders found for this user" };
    return;
  }

  ctx.body = { orders };
});

// 獲取所有訂單 (需要管理員權限)
router.get("/orders", async (ctx) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "email");

  ctx.body = { orders };
});

// 更新訂單狀態
router.put("/orders/:id", async (ctx) => {
  const { id } = ctx.params;
  const { status, trackingNumber } = ctx.request.body;

  const order = await Order.findById(id);
  if (!order) {
    ctx.status = 404;
    ctx.body = { error: "訂單未找到" };
    return;
  }

  // 更新狀態或追踪號碼
  if (status) order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;

  await order.save();

  ctx.body = { message: "Order updated successfully", order };
});

// 刪除訂單 (取消)
router.delete("/orders/:id", async (ctx) => {
  const { id } = ctx.params;

  const order = await Order.findById(id);
  if (!order) {
    ctx.status = 404;
    ctx.body = { error: "訂單未找到" };
    return;
  }

  // 僅允許取消 Pending 訂單
  if (order.status !== "Pending") {
    ctx.status = 400;
    ctx.body = { error: "不能取消非待處理訂單" };
    return;
  }

  await order.deleteOne();

  ctx.body = { message: "Order cancelled successfully" };
});

module.exports = router;
