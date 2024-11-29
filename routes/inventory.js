// src/routes/inventory.js
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
    ctx.body = { error: "Product not found" };
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
    ctx.body = { error: "Inventory not found" };
    return;
  }

  // 更新庫存數量
  inventory.quantity += quantityChange;

  if (inventory.quantity < 0) {
    ctx.status = 400;
    ctx.body = { error: "Insufficient stock" };
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
    ctx.body = { error: "No inventory found for this product" };
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
    ctx.body = { error: "Inventory not found for this product" };
    return;
  }

  inventory.quantity = quantity;
  await inventory.save();

  ctx.body = { message: "Inventory reset successfully", inventory };
});

module.exports = router;
