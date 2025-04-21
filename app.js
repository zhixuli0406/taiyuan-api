const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { ensureAdminAuth } = require("./middlewares/auth");
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
  'http://localhost:3000',
  'https://taiyuan.dudustudio.monster'
];

// 如果生產環境有不同的來源，也從環境變數讀取
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(cors({
  origin: function (ctx) {
    const requestOrigin = ctx.accept.headers.origin;
    if (!requestOrigin) { // For requests with no Origin header (like simple requests or server-to-server)
        return ''; // Or handle as needed, maybe disallow? Depends on your security needs.
    }
    if (allowedOrigins.includes(requestOrigin)) {
      return requestOrigin; // Reflect the matched origin
    }
    // Optionally return a default allowed origin or an empty string/null to block
    return false; // Block requests from origins not in the list
  },
  credentials: true
}));

// 使用 bodyParser 中間件
app.use(bodyParser());

// 使用路由
app.use(authRoutes.routes());
app.use(adminRoutes.routes());
app.use(productRoutes.routes());
app.use(categoryRoutes.routes());
app.use(cartRoutes.routes());
app.use(customerRoutes.routes());
app.use(couponRoutes.routes());
app.use(carouselRoutes.routes());
app.use(inventoryRoutes.routes());
app.use(orderRoutes.routes());
app.use(storeSettingsRoutes.routes());
app.use(analyticsRoutes.routes());
app.use(imageRoutes.routes());
app.use(transportRoutes.routes());

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
