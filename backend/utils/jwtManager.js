// 引入jwt-simple
const jwt = require('jwt-simple');
const KEY = 'web0705';

module.exports = {
  encodeToken(id) {
    // 此处把时间戳设置为有效期三十分钟后，方便校验时比对
    return jwt.encode({ id, expires: Date.now() + 1000 * 60 }, KEY);
  },
  decodeToken(token) {
    return jwt.decode(token, KEY);
  },
};
