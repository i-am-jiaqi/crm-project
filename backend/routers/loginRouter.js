const express = require('express');
const md5 = require('md5');
const adminModel = require('../db/models/adminModel');
const router = express.Router();

// 引入封装的jwtManager
const jwtManager = require('../utils/jwtManager');

// 登录
router.post('/login', async (req, res) => {
  // 思路步骤：
  // 1 接收客户端上传的用户名和密码
  const { username, password } = req.fields;
  // 2 根据用户名和密码查询数据库，进行比对查看是否有这条数据
  // findOne是一种数据库方法，找到数据库就返回数据对象，找不到返回null
  // 注意：由于注册时密码加密，所以查询时需要用加密后的密文进行查询
  const admin = await adminModel.findOne({ username, password: md5(password) });
  if (admin) {
    // 3 如果比对数据存在，则生成token，然后将token存储到数据库中，并将token响应给浏览器
    // 3.1 生成token，token里面需要添加时间戳，用于后面校验token有效期
    const token = jwtManager.encodeToken(admin._id);

    // 3.2 将token存储到数据库中，存储到当前登录用户的token字段里
    // updateOne是更新数据库的方法，$set是修改数据{token:token}==>省略为{token}
    await adminModel.updateOne(
      { _id: admin._id },
      { $set: { token, last_login: Date.now() } }
    );
    // 将token、admin信息响应给浏览器
    res.send({
      status: 1,
      message: '登录成功',
      token,
      admin: { id: admin._id, username: admin.username },
    });
  } else {
    // 4 如果没有数据，则直接响应客户端，用户名或密码错误
    res.send({ status: 0, message: '登录失败，用户名或密码错误' });
  }
});

// 退出登录
router.get('/logout', async (req, res) => {
  // 1 获取用户id
  const { id } = req.query;
  // 2 删除token
  await adminModel.updateOne({ _id: id }, { $set: { token: '' } });
  // 3 响应
  res.send({ status: 1, message: '退出登录' });
});

module.exports = router;
