// 管理员对应的model（集合）
const mongoose = require('mongoose');
const advSchema = require('../schemas/advSchema');
// mongoose.model第一个参数是集合名，第二个参数是schema
const advModel = mongoose.model('advs', advSchema);
module.exports = advModel;
