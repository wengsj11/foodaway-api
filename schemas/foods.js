const mongoose = require('../db.js');

const foodSchema = mongoose.Schema({
  name: String, //食物名称
  price: Number, //单价
  desc: String, //介绍
  monthly: Number, //月销售量
  pic: String, //图片路径
  rid: mongoose.Schema.Types.ObjectId
})
foodSchema.statics.findByRid = function (rid,cb) {
  return this.find(rid ? { rid: new mongoose.Types.ObjectId(rid) } : {}, cb);
}


module.exports = mongoose.model('Foods', foodSchema);