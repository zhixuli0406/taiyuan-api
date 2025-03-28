const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
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

dotenv.config();
connectDB().then(()=>{
  initializeAdmin();
  initializeStoreSettings();
});

const app = new Koa();
app.use(cors()); // 解決 CORS 問題
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text'], // 支援的請求類型
  jsonLimit: '100mb', // JSON 格式的限制
  formLimit: '100mb', // 表單數據大小限制
  textLimit: '100mb', // 純文本數據大小限制
}));

app.use(ensureAdminAuth);

// 使用路由
app.use(productRoutes.routes());
app.use(authRoutes.routes());
app.use(cartRoutes.routes());
app.use(categoryRoutes.routes());
app.use(customerRoutes.routes());
app.use(couponRoutes.routes());
app.use(adminRoutes.routes());
app.use(carouselRoutes.routes());
app.use(inventoryRoutes.routes());
app.use(orderRoutes.routes());
app.use(storeSettingsRoutes.routes());
app.use(analyticsRoutes.routes());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
