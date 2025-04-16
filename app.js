const Koa = require("koa");
const Router = require("koa-router");
const cors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { ensureAdminAuth} = require("./middlewares/auth");

// 導入路由
const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/categories");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const customerRoutes = require("./routes/customers");
const couponRoutes = require("./routes/coupons");
const adminRoutes = require("./routes/admin");
const carouselRoutes = require("./routes/carousels");
const inventoryRoutes = require("./routes/inventory");
const orderRoutes = require("./routes/orders");
const storeSettingsRoutes = require("./routes/storeSettings");
const analyticsRoutes = require("./routes/analytics");
const initializeAdmin = require("./config/initAdmin");
const initializeStoreSettings = require("./config/initStore");
const imageRoutes = require("./routes/images");
const transportRoutes = require("./routes/transport");
dotenv.config();
connectDB().then(()=>{
  initializeAdmin();
  initializeStoreSettings();
});

const app = new Koa();
const router = new Router();

// 連接 MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB 連接成功"))
  .catch((err) => console.error("MongoDB 連接失敗:", err));

// 配置 CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://taiyuan.dudustudio.monster",
  "https://www.taiyuan.dudustudio.monster",
  // 添加其他允許的域名
];

// 將 CORS 中間件放在最前面
app.use(
  cors({
    origin: (ctx) => {
      const origin = ctx.get("Origin");
      if (allowedOrigins.includes(origin)) {
        return origin;
      }
      return false; // 不允許其他來源
    },
    credentials: true,
    maxAge: 5, // Preflight 請求的緩存時間
  })
);

// 錯誤處理中間件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message || "伺服器錯誤",
    };
  }
});

// 配置 bodyParser
app.use(
  bodyParser({
    enableTypes: ["json", "form", "text"], // 支援的請求類型
    jsonLimit: "100mb", // JSON 格式的限制
    formLimit: "100mb", // 表單數據大小限制
    textLimit: "100mb", // 純文本數據大小限制
  })
);

// 使用路由
router.use("/api", adminRoutes.routes());
router.use("/api", productRoutes.routes());
router.use("/api", transportRoutes.routes());
router.use("/api", storeSettingsRoutes.routes());
router.use("/api", imageRoutes.routes());

app.use(router.routes());
app.use(router.allowedMethods());

// 配置 Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`伺服器運行在端口 ${PORT}`);
});
