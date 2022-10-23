import request from './index';

// 获取所有广告数据
export function reqGetAdvs() {
  return request.get('/findAdvs', {
    params: {
      id: JSON.parse(localStorage.getItem('user')).id,
    },
  });
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
export function reqDeleteAdv(advId) {
  return request.post('/deleteAdv', {
    advId,
    id: JSON.parse(localStorage.getItem('user')).id,
  });
}

// 修改广告
export function reqUpdateAdv(formdata) {
  return request.post('/updateAdv', formdata, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取一条广告数据
export function reqGetOneAdv(advId) {
  return request.get('/getOneAdv', {
    params: {
      advId,
      id: JSON.parse(localStorage.getItem('user')).id,
    },
  });
}
