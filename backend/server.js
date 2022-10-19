(async function () {
  const express = require('express');
  // 引入处理文件的中间件express-formidable
  const formidable = require('express-formidable');
  const adminRouter = require('./routers/adminRouter');
  const loginRouter = require('./routers/loginRouter');
  const verifyToken = require('./routers/verifyToken');
  const advRouter = require('./routers/advRouter');
  const connect = require('./db/connect');

  try {
    // 如果数据库连接成功，await下面的代码才会执行
    await connect;
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.log('数据库连接失败', error);
    return;
    // 退出
  }

  const app = express();

  // 使用处理静态资源的中间件
  app.use(express.static('public'));

  // 前端发送请求都是用axios，axios默认将请求主体的数据设置为json格式，所以服务器使用express.json处理
  // app.use(express.json());

  // 使用express-formidable处理客户端上传的文件
  // 注意：如果使用了这个中间件，回合express.json发生冲突
  // 之前的代码中req.body将获取不到数据，需要使用req.fields
  app.use(
    formidable({
      uploadDir: './public/uploadDir', //上传的图片存储位置
      keepExtensions: true, // 保留上传图片的后缀名
    })
  );

  // 管理员和广告页面对应的接口，后端路由都要写在最下面
  app.use(adminRouter);
  app.use(loginRouter);
  app.use(verifyToken);
  app.use(advRouter);

  app.listen(5001, (err) => {
    if (err) console.log('服务器启动失败');
    else console.log('服务器启动成功');
  });
})();
