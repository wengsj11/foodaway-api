const mongoose = require('../db.js');

const categorySchema = mongoose.Schema({
  name: String, //种类名称
})

module.exports = mongoose.model('Categories', categorySchema);