// src/routes/orders.js
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
    ctx.body = { error: "Order not found" };
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
    ctx.body = { error: "Order not found" };
    return;
  }

  // 僅允許取消 Pending 訂單
  if (order.status !== "Pending") {
    ctx.status = 400;
    ctx.body = { error: "Cannot cancel non-pending orders" };
    return;
  }

  await order.deleteOne();

  ctx.body = { message: "Order cancelled successfully" };
});

module.exports = router;
