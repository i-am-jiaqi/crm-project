// 这里定义发送请求的函数
import request from './index';

// 获取所有管理员数据的函数
export function reqGetAdmins() {
  // request.get的返回值是promise，promise成功的value就是服务器响应的数据，我们需要在调用这个函数的地址使用数据，所以必须把promise返回出去
  // axios发送请求，URL写相对路径，相对的是当前页面的URL地址
  return request.get('/findAdmins'); // http://localhost:7070/findAdmins
}

// 删除管理员函数
export function reqDeleteAdmin(_id) {
  return request.post('/deleteAdmin', {
    _id,
  });
}
