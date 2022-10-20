// 专门用来定义和广告页面相关的后端路由（接口）
const express = require('express');
// 引入操作广告数据的集合对象
const advModel = require('../db/models/advModel');
const router = express.Router();

// 引入封装的jwtManager
const jwtManager = require('../utils/jwtManager');

// 添加某条广告信息
router.post('/addAdv', async (req, res) => {
  // req.files 获取文件数据
  // req.fields 获取除文件外的其他信息
  // 1 获取添加广告表单中的普通信息
  const { advTitle, advLink, advCategory } = req.fields;
  // 2 获取广告图片的文件信息
  const { advImg } = req.files;
  console.log(req.files);
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
  res.send({ status: 1, message: '广告添加成功' });
});

// 自己写的获取所有广告数据
router.get('/findAdvs', async (req, res) => {
  const advs = await advModel.find();
  // 响应
  res.send({ status: 1, message: '查询成功', data: advs });
});
module.exports = router;
