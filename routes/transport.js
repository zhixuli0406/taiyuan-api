/**
 * @openapi
 * tags:
 *   name: Transport
 *   description: 運輸方式管理 API
 */

/**
 * @openapi
 * /transports:
 *   post:
 *     tags: [Transport]
 *     summary: 創建運輸方式
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - fee
 *             properties:
 *               name:
 *                 type: string
 *                 description: 運輸方式名稱
 *               fee:
 *                 type: number
 *                 description: 運輸費用
 *               description:
 *                 type: string
 *                 description: 運輸方式描述
 *               estimatedDays:
 *                 type: number
 *                 description: 預計運輸天數
 *     responses:
 *       200:
 *         description: 運輸方式創建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 transport:
 *                   $ref: '#/components/schemas/Transport'
 */

/**
 * @openapi
 * /transports:
 *   get:
 *     tags: [Transport]
 *     summary: 獲取所有運輸方式
 *     parameters:
 *       - name: isActive
 *         in: query
 *         description: 是否只獲取啟用的運輸方式
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: 成功獲取運輸方式列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transport'
 */

/**
 * @openapi
 * /transports/{id}:
 *   get:
 *     tags: [Transport]
 *     summary: 獲取單個運輸方式
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功獲取運輸方式
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transport:
 *                   $ref: '#/components/schemas/Transport'
 *       404:
 *         description: 運輸方式未找到
 */

/**
 * @openapi
 * /transports/{id}:
 *   put:
 *     tags: [Transport]
 *     summary: 更新運輸方式
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fee:
 *                 type: number
 *               description:
 *                 type: string
 *               estimatedDays:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 運輸方式更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 transport:
 *                   $ref: '#/components/schemas/Transport'
 *       404:
 *         description: 運輸方式未找到
 */

/**
 * @openapi
 * /transports/{id}:
 *   delete:
 *     tags: [Transport]
 *     summary: 刪除運輸方式
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 運輸方式刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: 運輸方式未找到
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Transport:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         fee:
 *           type: number
 *         description:
 *           type: string
 *         estimatedDays:
 *           type: number
 *         isActive:
 *           type: boolean
 *         createdBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *         updatedBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const Router = require("koa-router");
const Transport = require("../models/Transport");
const { ensureAdminAuth } = require("../middlewares/auth");

const router = new Router();

// 創建運輸方式
router.post("/transports", ensureAdminAuth, async (ctx) => {
  const { name, fee, description, estimatedDays } = ctx.request.body;
  const userId = ctx.state.user._id;

  const transport = new Transport({
    name,
    fee,
    description,
    estimatedDays,
    createdBy: userId,
    updatedBy: userId
  });

  await transport.save();
  ctx.body = { message: "Transport created successfully", transport };
});

// 獲取所有運輸方式
router.get("/transports", async (ctx) => {
  const { isActive } = ctx.query;
  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  const transports = await Transport.find(query)
    .populate("createdBy", "name")
    .populate("updatedBy", "name")
    .sort({ createdAt: -1 });

  ctx.body = { transports };
});

// 獲取單一運輸方式
router.get("/transports/:id", async (ctx) => {
  const transport = await Transport.findById(ctx.params.id)
    .populate("createdBy", "name")
    .populate("updatedBy", "name");

  if (!transport) {
    ctx.status = 404;
    ctx.body = { error: "Transport not found" };
    return;
  }

  ctx.body = { transport };
});

// 更新運輸方式
router.put("/transports/:id", ensureAdminAuth, async (ctx) => {
  const { name, fee, description, estimatedDays, isActive } = ctx.request.body;
  const userId = ctx.state.user._id;

  const transport = await Transport.findById(ctx.params.id);
  if (!transport) {
    ctx.status = 404;
    ctx.body = { error: "Transport not found" };
    return;
  }

  transport.name = name ?? transport.name;
  transport.fee = fee ?? transport.fee;
  transport.description = description ?? transport.description;
  transport.estimatedDays = estimatedDays ?? transport.estimatedDays;
  transport.isActive = isActive ?? transport.isActive;
  transport.updatedBy = userId;

  await transport.save();
  ctx.body = { message: "Transport updated successfully", transport };
});

// 刪除運輸方式
router.delete("/transports/:id", ensureAdminAuth, async (ctx) => {
  const transport = await Transport.findById(ctx.params.id);
  if (!transport) {
    ctx.status = 404;
    ctx.body = { error: "Transport not found" };
    return;
  }

  await transport.deleteOne();
  ctx.body = { message: "Transport deleted successfully" };
});

module.exports = router; 