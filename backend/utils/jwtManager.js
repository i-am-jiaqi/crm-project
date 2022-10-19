// 引入jwt-simple
const jwt = require('jwt-simple');
const KEY = 'web0705';

module.exports = {
  encodeToken(id) {
    return jwt.encode({ id, expires: Date.now() }, KEY);
  },
  decodeToken(token) {
    return jwt.decode(token, KEY);
  },
};
