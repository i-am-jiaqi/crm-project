// 管理员的约束条件
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const advSchema = new Schema({
  advTitle: {
    type: String,
    required: true,
  },
  advImg: {
    type: String,
    required: true,
  },
  advCategory: {
    type: String,
    required: true,
  },
  advLink: {
    type: String,
    required: true,
  },
  addAdvTime: {
    type: Date,
    default: Date.now,
  },
  updateAdvTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = advSchema;
