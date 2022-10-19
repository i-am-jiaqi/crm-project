// 管理员对应的model（集合）
const mongoose = require('mongoose');
const adminSchema = require('../schemas/adminSchema');
// mongoose.model第一个参数是集合名，第二个参数是schema
const adminModel = mongoose.model('admins', adminSchema);
module.exports = adminModel;
