// 创建axios实例
import axios from 'axios';

const request = axios.create({
  // 代理标识写在baseURL中
  baseURL: '/api',
});

// 查axios文档，如果是实例就配置在实例上，此处实例是request
// 配置响应拦截器，将axios响应的数据进行过滤
request.interceptors.response.use(function (response) {
  return response.data;
});

// 配置请求拦截器，将token添加到每一次请求的请求头中
request.interceptors.request.use(function (config) {
  config.headers.token = localStorage.getItem('token');
  return config;
});

export default request;
