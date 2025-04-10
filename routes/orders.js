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
 *             required:
 *               - userId
 *               - items
 *               - shippingMethod
 *               - receiverInfo
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用戶ID
 *               items:
 *                 type: array
 *                 description: 訂單商品列表
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       description: 商品ID
 *                     quantity:
 *                       type: number
 *                       description: 購買數量
 *                     price:
 *                       type: number
 *                       description: 商品單價
 *               shippingMethod:
 *                 type: string
 *                 enum: [CVS, HOME]
 *                 description: 配送方式 (CVS=超商取貨, HOME=宅配)
 *               receiverInfo:
 *                 type: object
 *                 required:
 *                   - name
 *                   - phone
 *                   - email
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: 收件人姓名
 *                   phone:
 *                     type: string
 *                     description: 收件人電話
 *                   email:
 *                     type: string
 *                     description: 收件人Email
 *                   address:
 *                     type: string
 *                     description: 收件地址(宅配必填)
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
 *                     _id:
 *                       type: string
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
 *                     shippingMethod:
 *                       type: string
 *                     logistics:
 *                       type: object
 *                       properties:
 *                         ReceiverName:
 *                           type: string
 *                         ReceiverPhone:
 *                           type: string
 *                         ReceiverEmail:
 *                           type: string
 *                         ReceiverAddress:
 *                           type: string
 *                     payment:
 *                       type: object
 *                       properties:
 *                         MerchantTradeNo:
 *                           type: string
 *                         TradeDesc:
 *                           type: string
 *                         TradeDate:
 *                           type: string
 *                           format: date-time
 *                 paymentForm:
 *                   type: string
 *                   description: 綠界支付表單 HTML
 *                 logisticsForm:
 *                   type: string
 *                   description: 綠界物流選擇表單 HTML (僅超商取貨時提供)
 *       400:
 *         description: 請求參數錯誤
 */

/**
 * @openapi
 * /orders/payment/callback:
 *   post:
 *     tags: [Orders]
 *     summary: 綠界支付回調
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               MerchantTradeNo:
 *                 type: string
 *               PaymentDate:
 *                 type: string
 *               PaymentType:
 *                 type: string
 *               PaymentTypeChargeFee:
 *                 type: string
 *               SimulatePaid:
 *                 type: string
 *     responses:
 *       200:
 *         description: 回調處理成功
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "1|OK"
 */

/**
 * @openapi
 * /orders/logistics/callback:
 *   post:
 *     tags: [Orders]
 *     summary: 綠界物流回調
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               MerchantTradeNo:
 *                 type: string
 *               LogisticsType:
 *                 type: string
 *               LogisticsSubType:
 *                 type: string
 *               CVSStoreID:
 *                 type: string
 *               CVSStoreName:
 *                 type: string
 *               CVSAddress:
 *                 type: string
 *               CVSTelephone:
 *                 type: string
 *               LogisticsStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: 回調處理成功
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "1|OK"
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
 *                       _id:
 *                         type: string
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
 *                       status:
 *                         type: string
 *                         enum: [Pending, Paid, Shipped, Completed, Cancelled]
 *                       shippingMethod:
 *                         type: string
 *                         enum: [CVS, HOME]
 *                       logistics:
 *                         type: object
 *                         properties:
 *                           LogisticsStatus:
 *                             type: string
 *                           CVSStoreName:
 *                             type: string
 *                           CVSAddress:
 *                             type: string
 *                       payment:
 *                         type: object
 *                         properties:
 *                           isPaid:
 *                             type: boolean
 *                           PaymentType:
 *                             type: string
 *                           PaymentDate:
 *                             type: string
 *                             format: date-time
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
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           email:
 *                             type: string
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
 *                       status:
 *                         type: string
 *                       logistics:
 *                         type: object
 *                       payment:
 *                         type: object
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: number
 *                       description: 總訂單數
 *                     pendingOrders:
 *                       type: number
 *                       description: 待處理訂單數
 *                     completedOrders:
 *                       type: number
 *                       description: 已完成訂單數
 *                     totalRevenue:
 *                       type: number
 *                       description: 總營收（僅計算已完成訂單）
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
const ecpay_payment = require('ecpay-payment');
const ecpay_logistics = require('ecpay-logistics');

const router = new Router();

// 創建訂單
router.post("/orders", async (ctx) => {
  const { 
    userId, 
    items, 
    shippingMethod,
    receiverInfo 
  } = ctx.request.body;

  // 計算訂單總金額
  let totalAmount = 0;
  items.forEach((item) => {
    totalAmount += item.price * item.quantity;
  });

  // 生成綠界商店訂單編號
  const merchantTradeNo = `${Date.now()}${Math.random().toString(36).substr(2, 6)}`;

  // 建立訂單
  const order = new Order({
    user: userId,
    items,
    totalAmount,
    shippingMethod,
    logistics: {
      ReceiverName: receiverInfo.name,
      ReceiverPhone: receiverInfo.phone,
      ReceiverEmail: receiverInfo.email,
      ReceiverAddress: receiverInfo.address,
    },
    payment: {
      MerchantTradeNo: merchantTradeNo,
      TradeDesc: "商品購買",
      TradeDate: new Date()
    }
  });

  await order.save();

  // 建立綠界物流訂單
  const logisticsOptions = {
    MerchantID: process.env.ECPAY_MERCHANT_ID,
    HashKey: process.env.ECPAY_LOGISTICS_HASH_KEY,
    HashIV: process.env.ECPAY_LOGISTICS_HASH_IV,
    IsProduction: process.env.NODE_ENV === 'production',
  };

  const ecpayLogistics = new ecpay_logistics(logisticsOptions);

  const logisticsParams = {
    MerchantTradeNo: merchantTradeNo,
    MerchantTradeDate: new Date().toLocaleString('zh-TW'),
    LogisticsType: shippingMethod === 'CVS' ? 'CVS' : 'HOME',
    LogisticsSubType: shippingMethod === 'CVS' ? 'FAMI' : 'TCAT', // 可依需求調整
    GoodsAmount: totalAmount,
    CollectionAmount: totalAmount,
    IsCollection: 'N',
    GoodsName: items.map(item => `${item.product.name}`).join('#'),
    SenderName: process.env.SHOP_NAME,
    SenderPhone: process.env.SHOP_PHONE,
    ReceiverName: receiverInfo.name,
    ReceiverPhone: receiverInfo.phone,
    ReceiverEmail: receiverInfo.email,
    ServerReplyURL: `${process.env.API_URL}/orders/logistics/callback`,
  };

  // 如果是宅配，添加地址
  if (shippingMethod === 'HOME') {
    logisticsParams.ReceiverAddress = receiverInfo.address;
  }

  // 建立綠界支付訂單
  const paymentOptions = {
    MerchantID: process.env.ECPAY_MERCHANT_ID,
    HashKey: process.env.ECPAY_HASH_KEY,
    HashIV: process.env.ECPAY_HASH_IV,
    ReturnURL: `${process.env.API_URL}/orders/payment/callback`,
    ClientBackURL: `${process.env.FRONTEND_URL}/orders/${order._id}`,
    OrderResultURL: `${process.env.FRONTEND_URL}/orders/${order._id}/result`,
  };

  const ecpayPayment = new ecpay_payment(paymentOptions);
  
  const paymentParams = {
    MerchantTradeNo: merchantTradeNo,
    MerchantTradeDate: new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/[/:]/g, ''),
    TotalAmount: totalAmount,
    TradeDesc: '商品購買',
    ItemName: items.map(item => `${item.product.name} x ${item.quantity}`).join('#'),
    ReturnURL: paymentOptions.ReturnURL,
    ClientBackURL: paymentOptions.ClientBackURL,
    OrderResultURL: paymentOptions.OrderResultURL,
  };

  // 產生綠界金流表單
  const paymentForm = ecpayPayment.payment_client.aio_check_out_all(paymentParams);
  
  // 如果是超商取貨，產生店鋪選擇表單
  let logisticsForm = null;
  if (shippingMethod === 'CVS') {
    logisticsForm = ecpayLogistics.create_client.create_cvs_map(logisticsParams);
  }

  ctx.body = { 
    message: "Order created successfully", 
    order,
    paymentForm,
    logisticsForm
  };
});

// 綠界支付回調
router.post("/orders/payment/callback", async (ctx) => {
  const { 
    MerchantTradeNo, 
    PaymentDate, 
    PaymentType, 
    PaymentTypeChargeFee, 
    SimulatePaid 
  } = ctx.request.body;

  const order = await Order.findOne({
    "payment.MerchantTradeNo": MerchantTradeNo
  });

  if (!order) {
    ctx.status = 404;
    ctx.body = { error: "訂單未找到" };
    return;
  }

  // 更新支付狀態
  order.payment.isPaid = true;
  order.payment.PaymentDate = new Date(PaymentDate);
  order.payment.PaymentType = PaymentType;
  order.payment.PaymentTypeChargeFee = PaymentTypeChargeFee;
  order.payment.SimulatePaid = SimulatePaid === 'Y';
  order.status = "Paid";

  await order.save();

  ctx.body = { message: "1|OK" };
});

// 綠界物流回調
router.post("/orders/logistics/callback", async (ctx) => {
  const { 
    MerchantTradeNo, 
    LogisticsType, 
    LogisticsSubType,
    CVSStoreID,
    CVSStoreName,
    CVSAddress,
    CVSTelephone,
    LogisticsStatus
  } = ctx.request.body;

  const order = await Order.findOne({
    "payment.MerchantTradeNo": MerchantTradeNo
  });

  if (!order) {
    ctx.status = 404;
    ctx.body = { error: "訂單未找到" };
    return;
  }

  // 更新物流資訊
  order.logistics.LogisticsType = LogisticsType;
  order.logistics.LogisticsSubType = LogisticsSubType;
  order.logistics.LogisticsStatus = LogisticsStatus;

  if (LogisticsType === 'CVS') {
    order.logistics.CVSStoreID = CVSStoreID;
    order.logistics.CVSStoreName = CVSStoreName;
    order.logistics.CVSAddress = CVSAddress;
    order.logistics.CVSTelephone = CVSTelephone;
  }

  await order.save();

  ctx.body = { message: "1|OK" };
});

// 查詢用戶訂單
router.get("/orders/my-orders", async (ctx) => {
  const { userId } = ctx.state.user;

  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

  if (!orders.length) {
    ctx.status = 404;
    ctx.body = { error: "未找到該用戶的訂單" };
    return;
  }

  ctx.body = { orders };
});

// 獲取所有訂單 (需要管理員權限)
router.get("/orders", async (ctx) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "email");

  // 计算统计信息
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === "Pending").length;
  const completedOrders = orders.filter(order => order.status === "Completed").length;
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status === "Completed") {
      return sum + order.totalAmount;
    }
    return sum;
  }, 0);

  ctx.body = { 
    orders,
    statistics: {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue
    }
  };
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

  ctx.body = { message: "訂單更新成功", order };
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

  ctx.body = { message: "訂單取消成功" };
});

module.exports = router;
