const mongoose = require('../db.js');
const userSchema = mongoose.Schema({
  username: String, //用户名
  phone: String, //手机号
  password: String, //密码
  address: String, //地址
  avatar: String //头像图片路径
})

//指定使用该模板的集合
//注意：mongoose会把collection的名字转成users小写加s，很坑。。。。
module.exports = mongoose.model('Users', userSchema);