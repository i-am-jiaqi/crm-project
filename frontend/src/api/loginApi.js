// 这里定义发送请求的函数
import request from './index';

// 登录接口
export function reqLogin(username, password) {
  return request.post('/login', {
    username,
    password,
  });
}

// 退出登录
export function reqLogout(id) {
  return request.get('/logout', {
    params: {
      id,
    },
  });
}
