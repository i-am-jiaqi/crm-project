(async function () {
  const express = require('express');
  const adminRouter = require('./routers/adminRouter');
  const loginRouter = require('./routers/loginRouter');
  const verifyToken = require('./routers/verifyToken');
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

  // 前端发送请求都是用axios，axios默认将请求主体的数据设置为json格式，所以服务器使用express.json处理
  app.use(express.json());
  // 管理员对应的接口，后端路由都要写在最下面
  app.use(adminRouter);
  app.use(loginRouter);
  app.use(verifyToken);

  app.listen(5001, (err) => {
    if (err) console.log('服务器启动失败');
    else console.log('服务器启动成功');
  });
})();
