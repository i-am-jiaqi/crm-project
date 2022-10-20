// 管理员的约束条件
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const adminSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  last_login: {
    type: Date,
    default: Date.now,
  },
  register_date: {
    type: Date,
    default: Date.now,
  },
  token: {
    type: String,
    default: '',
  },
});

module.exports = adminSchema;
