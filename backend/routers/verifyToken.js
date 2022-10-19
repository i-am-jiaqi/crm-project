const express = require('express');
const adminModel = require('../db/models/adminModel');
const { decodeToken } = require('../utils/jwtManager');
const router = express.Router();

// 引入封装的jwtManager
const jwtManager = require('../utils/jwtManager');

//验证token
router.post('/verifyToken', async (req, res) => {
  // 接收当前登录用户的id，data在请求体中，用req.fields
  const { id } = req.fields;
  // 接收请求头中的token，post接收请求头中的数据用req.get('')
  const token = req.get('token');
  // 开始进行校验 1.是否有token 2.token是否与数据库中的一致 3.是否过期
  // 1.校验是否有token
  // token不存在
  if (!token) return res.send({ status: 0, message: 'token无效，请重新登录' });
  // 2.存在token，校验是否与数据库中一致，使用findOne()方法，返回的是admin对象
  const admin = await adminModel.findOne({ _id: id, token });
  // admin不存在，无法匹配一致
  if (!admin) return res.send({ status: 0, message: 'token无效，请重新登录' });
  // 3.校验token有效期
  // 3.1 解密token
  const obj = jwtManager.decodeToken(token);
  // 3.3 获取当前登录用户token有效期时间戳，也就是截止时间
  const loginTime = obj.expires;
  // 获取校验token时当下的时间戳
  const currentTime = Date.now();
  // 如果token有效截止时间小于当前时间，则token失效
  if (currentTime >= loginTime)
    return res.send({ status: 0, message: 'token无效，请重新登录' });
  // 如果通过1.2.3.校验，则登录有效
  res.send({ status: 1, message: 'token验证成功' });
});

module.exports = router;
