// src/routes/inventory.js

/**
 * @openapi
 * tags:
 *   name: Inventory
 *   description: 库存管理的 API
 */

/**
 * @openapi
 * /inventory:
 *   post:
 *     tags: [Inventory]
 *     summary: 创建库存
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
 *               safeStock:
 *                 type: number
 *               warehouse:
 *                 type: string
 *     responses:
 *       201:
 *         description: 库存创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 inventory:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     safeStock:
 *                       type: number
 *                     warehouse:
 *                       type: string
 *       404:
 *         description: 产品未找到
 */

/**
 * @openapi
 * /inventory/{id}:
 *   put:
 *     tags: [Inventory]
 *     summary: 更新库存数量
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 库存的 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantityChange:
 *                 type: number
 *     responses:
 *       200:
 *         description: 库存更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 inventory:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: number
 *       400:
 *         description: 库存不足或请求参数错误
 *       404:
 *         description: 库存未找到
 */

/**
 * @openapi
 * /inventory/{productId}:
 *   get:
 *     tags: [Inventory]
 *     summary: 查询库存状态
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: 产品的 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取库存状态
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inventories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       safeStock:
 *                         type: number
 *                       warehouse:
 *                         type: string
 *       404:
 *         description: 未找到该产品的库存
 */

/**
 * @openapi
 * /inventory/low-stock:
 *   get:
 *     tags: [Inventory]
 *     summary: 查询低库存商品
 *     responses:
 *       200:
 *         description: 成功获取低库存商品
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lowStockItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       safeStock:
 *                         type: number
 *                       warehouse:
 *                         type: string
 */

/**
 * @openapi
 * /inventory/reset/{productId}:
 *   put:
 *     tags: [Inventory]
 *     summary: 重置库存
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: 产品的 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: 库存重置成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 inventory:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: number
 *       404:
 *         description: 未找到该产品的库存
 */

const Router = require("koa-router");
const Inventory = require("../models/Inventory");
const Product = require("../models/Product"); // 假設您已經有產品模型設計

const router = new Router();

// 創建庫存 (POST /inventory)
router.post("/inventory", async (ctx) => {
  const { productId, quantity, safeStock, warehouse } = ctx.request.body;

  // 驗證產品是否存在
  const product = await Product.findById(productId);
  if (!product) {
    ctx.status = 404;
    ctx.body = { error: "產品未找到" };
    return;
  }

  const inventory = new Inventory({
    product: productId,
    quantity,
    safeStock,
    warehouse,
  });

  await inventory.save();
  ctx.body = { message: "Inventory created successfully", inventory };
});

// 更新庫存數量 (PUT /inventory/:id)
router.put("/inventory/:id", async (ctx) => {
  const { id } = ctx.params;
  const { quantityChange } = ctx.request.body; // 增加或扣減的數量

  const inventory = await Inventory.findById(id);
  if (!inventory) {
    ctx.status = 404;
    ctx.body = { error: "庫存未找到" };
    return;
  }

  // 更新庫存數量
  inventory.quantity += quantityChange;

  if (inventory.quantity < 0) {
    ctx.status = 400;
    ctx.body = { error: "庫存不足或請求參數錯誤" };
    return;
  }

  await inventory.save();
  ctx.body = { message: "Inventory updated successfully", inventory };
});

// 查詢庫存狀態 (GET /inventory/:productId)
router.get("/inventory/:productId", async (ctx) => {
  const { productId } = ctx.params;

  const inventories = await Inventory.find({ product: productId }).populate(
    "product"
  );
  if (inventories.length === 0) {
    ctx.status = 404;
    ctx.body = { error: "未找到該產品的庫存" };
    return;
  }

  ctx.body = { inventories };
});

// 查詢低庫存商品 (GET /inventory/low-stock)
router.get("/inventory/low-stock", async (ctx) => {
  const lowStockItems = await Inventory.find({
    quantity: { $lt: "$safeStock" },
  }).populate("product");

  ctx.body = { lowStockItems };
});

// 重置庫存 (PUT /inventory/reset/:productId)
router.put("/inventory/reset/:productId", async (ctx) => {
  const { productId } = ctx.params;
  const { quantity } = ctx.request.body;

  const inventory = await Inventory.findOne({ product: productId });
  if (!inventory) {
    ctx.status = 404;
    ctx.body = { error: "未找到該產品的庫存" };
    return;
  }

  inventory.quantity = quantity;
  await inventory.save();

  ctx.body = { message: "Inventory reset successfully", inventory };
});

module.exports = router;
