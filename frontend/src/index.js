// 引入实现单页面应用的第三方包sme-router
import SMERouter from 'sme-router';

import dayjs from 'dayjs';

// 引入模板
// index是一个函数,传入数据,返回解析后的字符串
import index from '@v';
import login from '@v/login';
import adminList from '@v/adminList';
import advList from '@v/advList';
import notFound from '@v/404';

// 引入发送请求的函数
import { reqGetAdmins, reqDeleteAdmin } from './api/adminApi';
import { reqLogin, reqLogout, reqVerifyToken } from './api/loginApi';

// 实例化配置前端路由规则的路由对象
// 传入index.html中用于渲染各个页面的节点id
// 第二个参数不传默认为哈希模式，传入‘html5’改为history模式
const router = new SMERouter('root', 'html5');

// 由于代码使用了模块化，每一个js文件都是单独的模块，因此每一个模块的变量都为局部变量
// 如果全局要使用，需要手动将变量暴露到全局
window.router = router;

// 配置前端路由规则：
router.route('/login', function (req, res) {
  // 当路径为/login时，这个回调函数会执行
  // req对象可以获取到一些参数
  // res对象可以帮我们配置前端路由规则中某个路径所对应的视图结构
  // render中要传入的字符串，会在路径匹配时渲染到root中，展示在页面中
  // login函数调用的实参，就是要传入到模板中的数据

  // 渲染login页面
  res.render(login());

  // 登录
  $('#loginBtn').on('click', async function (e) {
    // 阻止默认行为！
    e.preventDefault();
    // 1 获取表单中用户输入的用户名和密码
    const username = $('#username').val().trim();
    const password = $('#password').val().trim();
    // 2 封装发送请求的函数并调用
    const result = await reqLogin(username, password);
    // 3 根据响应结果判断是否登录成功，成功则提示客户，并跳转首页
    if (result.status) {
      // 3.1 跳转首页
      router.go('/index', { username: result.admin.username });
      // 3.2 提示用户
      toastr.success(result.message);
      // 3.3 存储token
      localStorage.setItem('token', result.token);
      // 3.4 存储当前用户信息
      localStorage.setItem('user', JSON.stringify(result.admin));
    } else {
      // 4 如果没有登录成功，则不跳转，直接提示客户
      toastr.error(result.message);
    }
  });
});

// 首页
router.route('/index', async function (req, res, next) {
  // 如果要在/index里面渲染二级路由，需要按照下面这样写
  // 页面验证token
  const verifyResult = await reqVerifyToken(
    JSON.parse(localStorage.getItem('user')).id
  );
  if (!verifyResult.status) {
    toastr.error(verifyResult.message);
    router.go('/login');
    return;
  }
  // console.log(req); // req里有个body里面有username
  next(
    index({
      username: req.body.username,
      url: req.url, //将当前浏览器地址栏的路径传入到index模板中
      subRoute: res.subRoute(), // res.subRoute() ==> <div id="__sub-route-view"></div> 这个标签用来渲染二级路由的结构
    })
  );

  // 退出登录逻辑
  // 1 点击退出登录按钮，注册事件
  $('#logoutBtn').on('click', async function () {
    localStorage.removeItem('username');
    // 2 删除本地token
    localStorage.setItem('token', '');
    // 3 给服务器发送请求，删除数据库中的token
    // 3.1 从localStorage获取用户id
    const id = JSON.parse(localStorage.getItem('user')).id;
    await reqLogout(id);
    // 4 提示用户
    toastr.success('退出登录');
    // 5 跳转登录页面
    router.go('/login');
  });
});

// 定义/index下面的嵌套路由
// 广告页
router.route('/index/advList', async function (req, res) {
  // 页面验证token
  const verifyResult = await reqVerifyToken(
    JSON.parse(localStorage.getItem('user')).id
  );
  if (!verifyResult.status) {
    toastr.error(verifyResult.message);
    router.go('/login');
    return;
  }
  res.render(advList());
});

// 管理员页面
router.route('/index/adminList', async function (req, res) {
  // 页面验证token
  const verifyResult = await reqVerifyToken(
    JSON.parse(localStorage.getItem('user')).id
  );
  if (!verifyResult.status) {
    toastr.error(verifyResult.message);
    router.go('/login');
    return;
  }
  // 1 发送请求获取管理员数据
  // 2 下载axios
  // 3 发送请求
  const result = await reqGetAdmins();
  // result.data是一个数组，数组中有管理员数据，管理员数据中有和日期相关的数据，但是展示格式不好看，所以需要格式化之后再渲染
  result.data.forEach((item) => {
    item.last_login = dayjs(item.last_login).format('YYYY-MM-DD HH:mm:ss');
    item.register_date = dayjs(item.register_date).format(
      'YYYY-MM-DD HH:mm:ss'
    );
  });

  res.render(adminList(result.data));

  $('.delete').on('click', function () {
    reqDeleteAdmin(this.id);
    window.location.reload();
  });
});

// 重定向
router.route('*', (req, res) => {
  res.redirect('/login');
});
