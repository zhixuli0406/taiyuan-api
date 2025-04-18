const mongoose = require("mongoose");

const storeSettingSchema = new mongoose.Schema({
  name: { type: String, required: true, default: "My Store" }, // 商店名稱
  contact: {
    phone: { type: String, default: "" },                      // 聯繫電話
    email: { type: String, default: "" },                      // 聯繫郵箱
  },
  address: {
    country: { type: String, default: "" },                    // 國家
    city: { type: String, default: "" },                       // 城市
    addressLine: { type: String, default: "" },                // 詳細地址
  },
  businessHours: { type: String, default: "9:00 AM - 9:00 PM" }, // 營業時間
  appearance: {
    logo: { type: String, default: "" },                       // 商店 Logo URL
    themeColor: { type: String, default: "#ffffff" },          // 主色調
  },
  socialLinks: {
    facebook: { type: String, default: "" },
    line: { type: String, default: "" },
    instagram: { type: String, default: "" },
  },
}, { timestamps: true });

module.exports = mongoose.model("StoreSetting", storeSettingSchema);