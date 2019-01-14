const mongoose = require('mongoose');
const dburl = 'mongodb://localhost:27017/foodaway';

// 连接数据库
mongoose.connect(dburl);

/* 链接成功 */
mongoose.connection.on('connected', function() {
  console.log('Mongoose connection open to ' + dburl);
});

// 链接异常
mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error:' + err);
});

// 链接断开
mongoose.connection.on('disconnected', function() {
  console.log('Mongoose connection disconnected');
});
module.exports = mongoose ;