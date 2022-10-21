// 专门用来定义和广告页面相关的后端路由（接口）
const express = require('express');
// 引入fs模块，删除广告图片
const fs = require('fs');
// 引入path模块，拼接被删除的文件的绝对路径
const { resolve } = require('path');
// 引入操作广告数据的集合对象
const advModel = require('../db/models/advModel');
const adminModel = require('../db/models/adminModel');
const router = express.Router();

// 引入封装的jwtManager
const jwtManager = require('../utils/jwtManager');

// 定义一个验证token的中间件，广告的增删改查都要先校验token
async function verifyTokenFirst(req, res, next) {
  // 接收当前用户id
  const id = req.fields.id || req.query.id;
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
  // 上面三次校验都通过，登录有效
  next();
}

// 添加某条广告信息，中间件写在第二个参数
router.post('/addAdv', verifyTokenFirst, async (req, res) => {
  // req.files 获取文件数据
  // req.fields 获取除文件外的其他信息
  // 1 获取添加广告表单中的普通信息
  const { advTitle, advLink, advCategory } = req.fields;
  // 2 获取广告图片的文件信息
  const { advImg } = req.files;
  // console.log(req.files);
  // 3 根据上传的文件信息，拼接一个可以被访问的url地址
  const filename = advImg.path.replace('public/uploadDir', '');
  // 4 拼接url地址,为advImg的链接
  const advImgAddress = 'http://localhost:5001/uploadDir' + filename;
  // 5 将广告数据存储到数据库中
  await advModel.create({
    advTitle,
    advLink,
    advCategory,
    advImg: advImgAddress,
  });
  // 6 添加完毕后，重新获取数据库中的所有广告数据，并响应给浏览器
  const refreshAdvData = await advModel.find();
  // 7 响应
  res.send({ status: 1, message: '广告添加成功', data: refreshAdvData });
});

// 获取所有广告数据
router.get('/findAdvs', verifyTokenFirst, async (req, res) => {
  const advs = await advModel.find();
  // 响应
  res.send({ status: 1, message: '查询成功', data: advs });
});

// 删除某条广告数据
router.post('/deleteAdv', async (req, res) => {
  // 从请求体获取id
  const { advId } = req.fields;
  // console.log(advId);
  // 删除之前先找到这条广告数据，拿到广告图片的文件名
  const adv = await advModel.findOne({ _id: advId });
  const fileName = adv.advImg.replace('http://localhost:5001/uploadDir/', '');
  await advModel.deleteOne({ _id: advId });
  // 手动删除当前数据对应的图片
  const path = resolve(__dirname, '../public/uploadDir', fileName);
  fs.unlinkSync(path);
  const refreshAdvData = await advModel.find();
  res.send({ status: 1, message: '删除成功', data: refreshAdvData });
});

module.exports = router;
