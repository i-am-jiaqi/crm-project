import request from './index';

// 获取所有广告数据
export function reqGetAdvs() {
  return request.get('/findAdvs');
}

// 添加广告数据
export function reqAddAdvs(formdata) {
  // 注意：1 axios使用时，要上传formdata数据，就直接把formdata写在data的位置上
  return request.post('/addAdv', formdata, {
    // 2 如果axios配合formdata，就必须手动设置一下请求头中的content-type值
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 删除广告数据
export function reqDeleteAdv(_id) {
  return request.post('/deleteAdv', {
    _id,
  });
}
