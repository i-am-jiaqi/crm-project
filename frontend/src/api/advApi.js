// 自己写的获取所有广告数据
import request from './index';

export function reqGetAdvs() {
  return request.get('/findAdvs');
}

export function reqAddAdvs(formdata) {
  return request.post('/addAdv', formdata);
}
