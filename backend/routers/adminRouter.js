// 专门用来定义和管理员相关的后端路由（接口）
// 定义路由器中间件
// 所有模块化规范，引入只执行一次
const express = require('express');
const md5 = require('md5'); // 加密的第三方包
const router = express.Router();

// 引入操作管理员数据的集合对象
const adminModel = require('../db/models/adminModel');
// 添加管理员
router.post('/addAdmin', async (req, res) => {
  // 1.获取用户上传的用户名和密码
  let { username, password } = req.fields;
  // 2.把密码转为密文 npm i md5
  password = md5(password);
  // 3.将用户名和加密之后的密码插入到数据库中
  await adminModel.create({
    username,
    password,
  });
  // 4.提示用户注册成功
  res.send('添加成功');
});

// 获取所有管理员数据
router.get('/findAdmins', async (req, res) => {
  // 查询所有管理员数据
  const admins = await adminModel.find();
  // 响应
  res.send({ status: 1, message: '查询成功', data: admins });
});

// 删除某条管理员数据
router.post('/deleteAdmin', async (req, res) => {
  // 从请求体获取username
  let { _id } = req.fields;
  // 删除
  const deleteAdmin = await adminModel.deleteOne({ _id });
  if (deleteAdmin.deletedCount) {
    res.send({ status: 1, message: '删除成功' });
  } else {
    res.send({ status: 0, message: `${_id}用户不存在，删除失败` });
  }
});

module.exports = router;
