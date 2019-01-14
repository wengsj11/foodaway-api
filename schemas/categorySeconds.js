const mongoose = require('../db.js');

const categorySecondSchema = mongoose.Schema({
  name: String, //种类名称
  cid: mongoose.Schema.Types.ObjectId //一级种类id
})

categorySecondSchema.statics.findByCid = function (cid, cb) {
  return this.find(cid ? { cid: new mongoose.Types.ObjectId(cid) } : {}, cb);
}

module.exports = mongoose.model('CategorySeconds', categorySecondSchema);