// 引入实现单页面应用的第三方包sme-router
import SMERouter from 'sme-router';

import dayjs from 'dayjs';
window.dayjs = dayjs;
// 引入模板
// index是一个函数,传入数据,返回解析后的字符串
import index from '@v';
import login from '@v/login';
import adminList from '@v/adminList';
import advList from '@v/advList';

// 引入发送请求的函数
import { reqGetAdmins, reqDeleteAdmin } from './api/adminApi';
import { reqLogin, reqLogout, reqVerifyToken } from './api/loginApi';
import {
  reqAddAdvs,
  reqGetAdvs,
  reqDeleteAdv,
  reqUpdateAdv,
  reqGetOneAdv,
} from './api/advApi';

// 实例化配置前端路由规则的路由对象
// 传入index.html中用于渲染各个页面的节点id
// 第二个参数不传默认为哈希模式，传入‘html5’改为history模式
const router = new SMERouter('root', 'html5');

// 由于代码使用了模块化，每一个js文件都是单独的模块，因此每一个模块的变量都为局部变量
// 如果全局要使用，需要手动将变量暴露到全局
window.router = router;

// 声明一个当前作用域的变量，用于存储要修改的广告id
let updateAdvId = '';

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
      // 3.1 存储token
      localStorage.setItem('token', result.token);
      // 3.2 存储当前用户信息
      localStorage.setItem('user', JSON.stringify(result.admin));
      // 3.3 跳转首页
      router.go('/index', { username: result.admin.username });
      // 3.4 提示用户
      toastr.success(result.message);
    } else {
      // 4 如果没有登录成功，则不跳转，直接提示客户
      toastr.error(result.message);
    }
  });
});

// 首页
router.route('/index', async function (req, res, next) {
  // 如果要在/index里面渲染二级路由，需要按照下面这样写
  // 验证用户是否存在
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return router.go('/login');
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
      username: req.body.username, // 登录成功之后,传递过来的用户名
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

  // 查询所有广告数据,并渲染
  const result = await reqGetAdvs();
  res.render(advList(result.data));

  // 实现上传图片预览
  // 获取上传文件input框的dom对象，并注册change事件
  $('.delegation').on('change', '.advImgFile', function (e) {
    try {
      // 1 创建reader对象
      const reader = new FileReader();
      // 2 将选中的文件转成base64
      // 可以通过事件的files属性拿到文件信息
      reader.readAsDataURL(e.target.files[0]);
      // 3 通过reader.load获取转换后的图片
      reader.onload = function (e) {
        // console.log(e.target.result) // 转换后的base64
        // 4 将base64赋值给预览的图片
        $('#advImgPreview')[0].src = e.target.result;
      };
    } catch (error) {
      $('#advImgPreview')[0].src = '';
    }
  });

  // 新增广告数据
  // 获取模态框保存按钮，注册点击事件
  $('.delegation').on('click', '#saveAdv', async function (e) {
    // 上传表单，用formdata获取表单数据
    const formdata = new FormData($('#addAdvForm')[0]);

    // 声明一个addOrEditResult变量用于接收保存或修改响应回来的最新的响应对象
    let addOrEditResult;

    // 判断是保存还是修改
    if (e.target.innerText === '保存') {
      // 进行表单校验，每一个表单值都不能为空
      if (
        !formdata.get('advTitle') ||
        !formdata.get('advCategory') ||
        !formdata.get('advLink') ||
        !formdata.get('advImg').size
      )
        return toastr.error('请正确填写表单');

      // 由于服务器接口要校验token，所以除了添加的数据之外，要额外添加当前用户id
      formdata.append('id', JSON.parse(localStorage.getItem('user')).id);
      addOrEditResult = await reqAddAdvs(formdata);
    } else {
      // 修改的逻辑
      // 进行表单校验，每一个表单值都不能为空
      if (
        !formdata.get('advTitle') ||
        !formdata.get('advCategory') ||
        !formdata.get('advLink')
      )
        return toastr.error('请正确填写表单');

      // 发送请求之前，将广告id和用户id添加到formdata中
      formdata.append('advId', updateAdvId);
      // 由于服务器接口要校验token，所以除了添加的数据之外，要额外添加当前用户id
      formdata.append('id', JSON.parse(localStorage.getItem('user')).id);
      // 发送reqUpdateAdv请求，修改广告数据
      addOrEditResult = await reqUpdateAdv(formdata);
    }

    if (addOrEditResult.status) {
      // 清空表单
      $('#addAdvForm')[0].reset();
      // 清空预览图
      $('#advImgPreview')[0].src = '';
      // 提示用户验证成功
      toastr.success(addOrEditResult.message);
      // 刷新页面
      res.render(advList(addOrEditResult.data));
    } else {
      toastr.error(addOrEditResult.message);
      router.go('/login');
    }
  });

  // 删除广告数据
  $('.delegation').on('click', '.deleteAdv', async function (e) {
    // 获取要删除的数据的id,this.id也可以
    const advId = e.target.id;
    // 发送请求 删除广告
    const result = await reqDeleteAdv(advId);
    if (result.status) {
      // 提示
      toastr.success(result.message);
      // 重新渲染
      res.render(advList(result.data));
    } else {
      toastr.error(result.message);
      router.go('/login');
    }
  });

  // 修改广告数据，模态框里的内容
  $('.delegation').on('click', '.adv-update-btn', async function (e) {
    // 点击单条广告数据后，将模态框里的文本进行修改
    $('#modalTitle').text('修改广告');
    $('#saveAdv').text('修改');
    // 获取要修改数据的广告id
    // 如果自定义属性是以data-xxx的形式定义的，则获取时使用dataset获取，dataset是一个对象，对象中有所有data-形式的自定义属性
    const advId = e.target.dataset.id;
    // 发送请求获取数据
    const { adv } = await reqGetOneAdv(advId);
    // 将获取到的数据，插入到表单中
    $('input[name=advTitle]').val(adv.advTitle);
    $('input[name=advLink]').val(adv.advLink);
    $('input[name=advCategory]').val(adv.advCategory);
    $('#advImgPreview')[0].src = adv.advImg;

    // 把当前要修改的广告id存储的当前文件作用域变量updateAdvId
    updateAdvId = advId;
  });

  // 点击添加广告的按钮，修改标题文本和按钮文本
  $('.delegation').on('click', '.add-adv-btn', async function (e) {
    $('#modalTitle').text('添加广告');
    $('#saveAdv').text('保存');
    // 清空表单
    $('#addAdvForm')[0].reset();
    // 清空预览图
    $('#advImgPreview')[0].src = '';
  });
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
  });
});

// 重定向
router.route('*', (req, res) => {
  res.redirect('/login');
});
