const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  authId: { type: String, required: true },  // Auth0 提供的唯一用戶識別 ID
  group: { type: String, default: 'regular' }  // 使用者群組：regular, VIP 之類用做多層級
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);