const Router = require("koa-router");
const Order = require("../models/Order");

const router = new Router();

router.get("/analytics/overview", async (ctx) => {
  try {
    // 聚合查詢獲取統計數據
    const stats = await Order.aggregate([
      {
        $match: { status: { $in: ["Paid", "Completed"] } }, // 只統計已支付或完成的訂單
      },
      {
        $group: {
          _id: null, // 聚合整個集合
          totalRevenue: { $sum: "$totalAmount" }, // 計算總銷售額
          totalOrders: { $sum: 1 }, // 計算訂單數量
          totalProductsSold: { $sum: { $sum: "$items.quantity" } }, // 總售出產品數量
        },
      },
    ]);

    // 返回數據
    ctx.body =
      stats.length > 0
        ? stats[0]
        : { totalRevenue: 0, totalOrders: 0, totalProductsSold: 0 };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.get("/analytics/sales", async (ctx) => {
  const { start, end } = ctx.query;
  const startDate = new Date(start || "2000-01-01"); // 默認從很早的日期開始
  const endDate = new Date(end || Date.now()); // 默認到當前日期

  try {
    const salesData = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Paid", "Completed"] },
          date: { $gte: startDate, $lte: endDate }, // 篩選時間範圍內的訂單
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, // 按日期分組
          dailyRevenue: { $sum: "$totalAmount" }, // 每日銷售額
          dailyOrders: { $sum: 1 }, // 每日訂單數量
        },
      },
      {
        $sort: { _id: 1 }, // 按日期升序排列
      },
    ]);

    ctx.body = salesData;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.get("/analytics/status", async (ctx) => {
  try {
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status", // 按訂單狀態分組
          count: { $sum: 1 }, // 計算每種狀態的數量
        },
      },
    ]);

    ctx.body = statusCounts;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.get("/analytics/top-products", async (ctx) => {
  const limit = parseInt(ctx.query.limit) || 10; // 默認顯示前 10 名

  try {
    const topProducts = await Order.aggregate([
      {
        $unwind: "$items", // 展開每個訂單中的產品
      },
      {
        $group: {
          _id: "$items.product", // 按產品進行分組
          totalQuantity: { $sum: "$items.quantity" }, // 總銷量
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          }, // 總銷售金額
        },
      },
      {
        $sort: { totalQuantity: -1 }, // 按銷售量降序排列
      },
      { $limit: limit }, // 限制返回的產品數量
      {
        $lookup: {
          from: "products", // 連接 Product 集合，獲取產品詳細信息
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);

    ctx.body = topProducts;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

module.exports = router;
