const { resolve } = require('path');
const prod = require('./webpack.prod');

module.exports = {
  ...prod,
  mode: 'development',
  devServer: {
    static: {
      directory: resolve(__dirname, '../build'), //基于打包后的文件夹作为静态资源服务器的根目录
    },
    port: 7070, //设置端口号
    open: true, //自动打开浏览器
    historyApiFallback: true, //使用history模式增加此配置项，当找不到对应路由时，会将其定位到/
    //  开启自动编译服务器的代理功能，解决跨域问题
    proxy: {
      // 如果请求的路径中最开头是以/api开头的，则自动编译服务
      '/api': {
        target: 'http://localhost:5001', // 目标服务器
        // 当开发服务器给目标服务器发请求的时候，去掉路径中的/api
        pathRewrite: { '^/api': '' },
      },
    },
  },
};
