// 管理员对应的model（集合）
const mongoose = require('mongoose');
const adminSchema = require('../schemas/adminSchema');
const adminModel = mongoose.model('admins', adminSchema);
module.exports = adminModel;
