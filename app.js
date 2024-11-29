const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const { ensureAdminAuth, checkJwtWithExemption} = require("./middlewares/auth");

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

dotenv.config();
connectDB();

const app = new Koa();
app.use(cors()); // 解決 CORS 問題
app.use(bodyParser());

app.use(ensureAdminAuth);
app.use(checkJwtWithExemption);

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
