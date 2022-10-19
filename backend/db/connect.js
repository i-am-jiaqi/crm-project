// 专门用来连接数据库
const mongoose = require('mongoose');
// mongoose.connect的返回值是promise对象
module.exports = mongoose.connect('mongodb://127.0.0.1:27017/web0705');
