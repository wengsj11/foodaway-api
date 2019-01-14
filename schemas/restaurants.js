const mongoose = require('../db.js');

const restaurantSchema = mongoose.Schema({
  name: String, //商家名称
  score: Number, //评级星星数
  min_price: Number, //起送价
  delivery_fee: Number, //配送费
  delivery_time:Date, //配送时间
  monthly: Number, //月销售量
  avatar: String, //图片路径
  bulletin:String, //介绍
  csid: mongoose.Schema.Types.ObjectId
})
restaurantSchema.statics.findByPage = function (params, cb) {
  return this.find({ csid:params.csid }, cb).limit(10).skip((params.page-1) * 10);
}

module.exports = mongoose.model('Restaurants', restaurantSchema);