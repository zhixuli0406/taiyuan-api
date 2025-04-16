const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { ensureAdminAuth} = require("./middlewares/auth");
const serve = require("koa-static");
const Router = require("koa-router");

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
const imageRoutes = require("./routes/images");
const transportRoutes = require("./routes/transport");

const initializeAdmin = require("./config/initAdmin");
const initializeStoreSettings = require("./config/initStore");

dotenv.config();
connectDB().then(()=>{
  initializeAdmin();
  initializeStoreSettings();
});

const app = new Koa();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://taiyuan.dudustudio.monster',
  // 添加其他允許的域名
];

// 將 CORS 中間件放在最前面
app.use(cors({
  origin: (ctx) => {
    const requestOrigin = ctx.get('Origin');
    if (allowedOrigins.includes(requestOrigin)) {
      return requestOrigin;
    }
    return false; // 不允許其他來源
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'x-amz-acl'],
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5 // Preflight 請求的緩存時間
}));

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

// 設定 bodyParser
app.use(
  bodyParser({
    enableTypes: ["json", "form", "text"], // 支援的請求類型
    jsonLimit: "100mb", // JSON 格式的限制
    formLimit: "100mb", // 表單資料大小限制
    textLimit: "100mb", // 純文本資料大小限制
  })
);

// 使用路由
app.use(authRoutes.routes());
app.use(adminRoutes.routes());
app.use(productRoutes.routes());
app.use(transportRoutes.routes());
app.use(storeSettingsRoutes.routes());
app.use(imageRoutes.routes());
app.use(cartRoutes.routes());
app.use(categoryRoutes.routes());
app.use(customerRoutes.routes());
app.use(couponRoutes.routes());
app.use(carouselRoutes.routes());
app.use(inventoryRoutes.routes());
app.use(orderRoutes.routes());
app.use(analyticsRoutes.routes());

// 設定 Swagger UI
app.use(serve("node_modules/swagger-ui-dist"));

// 提供 Swagger JSON
const router = new Router();
router.get("/swagger.json", async (ctx) => {
  ctx.body = swaggerDocument;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
});
