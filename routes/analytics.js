/**
 * @openapi
 * tags:
 *   name: Analytics
 *   description: 分析數據的 API
 */

/**
 * @openapi
 * /analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: 獲取概覽統計數據
 *     responses:
 *       200:
 *         description: 成功獲取概覽數據
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                   description: 總銷售額
 *                 totalOrders:
 *                   type: number
 *                   description: 總訂單數
 *                 totalProductsSold:
 *                   type: number
 *                   description: 總售出產品數
 *                 averageOrderValue:
 *                   type: number
 *                   description: 平均訂單金額 (AOV)
 *       500:
 *         description: 伺服器錯誤
 */

/**
 * @openapi
 * /analytics/sales:
 *   get:
 *     tags: [Analytics]
 *     summary: 獲取銷售數據
 *     parameters:
 *       - name: start
 *         in: query
 *         required: false
 *         description: 開始日期 (YYYY-MM-DD)
 *         schema:
 *           type: string
 *       - name: end
 *         in: query
 *         required: false
 *         description: 結束日期 (YYYY-MM-DD)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功獲取銷售數據
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   dailyRevenue:
 *                     type: number
 *                   dailyOrders:
 *                     type: number
 *       500:
 *         description: 伺服器錯誤
 */

/**
 * @openapi
 * /analytics/status:
 *   get:
 *     tags: [Analytics]
 *     summary: 獲取訂單狀態統計
 *     responses:
 *       200:
 *         description: 成功獲取訂單狀態統計
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   count:
 *                     type: number
 *       500:
 *         description: 伺服器錯誤
 */

/**
 * @openapi
 * /analytics/top-products:
 *   get:
 *     tags: [Analytics]
 *     summary: 獲取銷售量最高的產品
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: 返回的產品數量限制
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功獲取銷售量最高的產品
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   totalQuantity:
 *                     type: number
 *                   totalRevenue:
 *                     type: number
 *                   productDetails:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         // 这里可以添加产品详细信息的属性
 *       500:
 *         description: 伺服器錯誤
 */

/**
 * @openapi
 * /analytics/sales-by-category:
 *   get:
 *     tags: [Analytics]
 *     summary: 依產品類別獲取銷售數據
 *     responses:
 *       200:
 *         description: 成功獲取依類別分的銷售數據
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: 產品類別名稱
 *                   totalRevenue:
 *                     type: number
 *                     description: 該類別總銷售額
 *                   totalQuantity:
 *                     type: number
 *                     description: 該類別總銷售數量
 *       500:
 *         description: 伺服器錯誤
 */

/**
 * @openapi
 * /analytics/revenue-per-customer:
 *   get:
 *     tags: [Analytics]
 *     summary: 依顧客獲取收益數據
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: 返回的顧客數量限制 (預設 20)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功獲取依顧客分的收益數據
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: 顧客 ID
 *                   totalRevenue:
 *                     type: number
 *                     description: 該顧客總消費金額
 *                   totalOrders:
 *                     type: number
 *                     description: 該顧客總訂單數
 *                   customerInfo:
 *                     type: object
 *                     description: 顧客詳細資訊 (如果找到的話)
 *                     properties:
 *                       # Add customer properties here based on your Customer model
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *       500:
 *         description: 伺服器錯誤
 */

const Router = require("koa-router");
const Order = require("../models/Order");
// Assuming you have a Product model, uncomment the following line if needed
// const Product = require('../models/Product');
// Assuming you have a Customer model, uncomment the following line if needed
// const Customer = require('../models/Customer');

const router = new Router();

router.get("/analytics/overview", async (ctx) => {
  try {
    // Aggregate query to get statistics
    const stats = await Order.aggregate([
      {
        $match: { status: { $in: ["Paid", "Completed"] } }, // Only count paid or completed orders
      },
      {
        $group: {
          _id: null, // Aggregate the entire collection
          totalRevenue: { $sum: "$totalAmount" }, // Calculate total revenue
          totalOrders: { $sum: 1 }, // Calculate number of orders
          totalProductsSold: { $sum: { $sum: "$items.quantity" } }, // Total number of products sold
        },
      },
      {
        $project: {
          _id: 0, // Exclude the default _id
          totalRevenue: 1,
          totalOrders: 1,
          totalProductsSold: 1,
          averageOrderValue: {
            $cond: [ // Handle division by zero
              { $eq: ["$totalOrders", 0] },
              0,
              { $divide: ["$totalRevenue", "$totalOrders"] }
            ]
          }
        }
      }
    ]);

    // Return data
    ctx.body =
      stats.length > 0
        ? stats[0]
        : { totalRevenue: 0, totalOrders: 0, totalProductsSold: 0, averageOrderValue: 0 };
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
  const limit = parseInt(ctx.query.limit) || 10; // Default to top 10

  try {
    const topProducts = await Order.aggregate([
      {
        $match: { status: { $in: ["Paid", "Completed"] } }, // Consider only paid or completed orders
      },
      {
        $unwind: "$items", // Expand products in each order
      },
      {
        $group: {
          _id: "$items.product", // Group by product
          totalQuantity: { $sum: "$items.quantity" }, // Total quantity sold
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          }, // Total revenue for the product
        },
      },
      {
        $sort: { totalQuantity: -1 }, // Sort by quantity descending
      },
      { $limit: limit }, // Limit the number of products returned
      {
        $lookup: {
          from: "products", // Join with Product collection for details
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
       {
        $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } // Unwind product details, keep product even if details not found
      }
    ]);

    ctx.body = topProducts;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// New route: Sales by Category
router.get("/analytics/sales-by-category", async (ctx) => {
  try {
    const salesByCategory = await Order.aggregate([
      {
        $match: { status: { $in: ["Paid", "Completed"] } } // Filter for paid/completed orders
      },
      {
        $unwind: "$items" // Unwind order items
      },
      {
        $lookup: { // Join with products collection
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      {
        $unwind: "$productInfo" // Unwind the product details array
      },
      {
        $group: {
          _id: "$productInfo.category", // Group by product category (Assuming 'category' field exists)
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }, // Sum revenue per category
          totalQuantity: { $sum: "$items.quantity" } // Sum quantity per category
        }
      },
      {
        $sort: { totalRevenue: -1 } // Sort categories by revenue descending
      }
    ]);
    ctx.body = salesByCategory;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Failed to get sales by category: ${error.message}` };
  }
});

// New route: Revenue per Customer
router.get("/analytics/revenue-per-customer", async (ctx) => {
  const limit = parseInt(ctx.query.limit) || 20; // Default to top 20 customers

  try {
    const revenuePerCustomer = await Order.aggregate([
      {
         // Ensure customerId exists and order is paid/completed
        $match: {
            status: { $in: ["Paid", "Completed"] },
            customerId: { $exists: true, $ne: null }
         }
      },
      {
        $group: {
          _id: "$customerId", // Group by customer ID (Assuming 'customerId' field exists)
          totalRevenue: { $sum: "$totalAmount" }, // Sum total amount spent by customer
          totalOrders: { $sum: 1 } // Count orders per customer
        }
      },
      {
        $sort: { totalRevenue: -1 } // Sort customers by total revenue descending
      },
      {
        $limit: limit // Limit the number of customers returned
      },
      {
        $lookup: { // Optionally join with customers collection for details
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customerInfo"
        }
      },
      {
         // Unwind customer details, keep record even if customer not found in customers collection
        $unwind: { path: "$customerInfo", preserveNullAndEmptyArrays: true }
      }
    ]);
    ctx.body = revenuePerCustomer;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Failed to get revenue per customer: ${error.message}` };
  }
});

module.exports = router;
