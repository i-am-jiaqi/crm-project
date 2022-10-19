const { resolve } = require('path');
// 打包html文件
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 克隆public下面除index.html文件以外的所有其他静态文件
const CopyPlugin = require('copy-webpack-plugin');

// 生产环境
module.exports = {
  entry: './src/index.js',
  output: {
    filename: './js/app.js',
    path: resolve(__dirname, '../build'),
    publicPath: '/', // 声明请求app.js时,请求路径从/开始. 单页面应用时实现二级路由时配置，解决url地址栏回车报错的问题
  },
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'public',
          to: resolve(__dirname, '../build'),
          globOptions: {
            ignore: ['**/index.html'],
          },
        },
      ],
    }),
  ],
  module: {
    rules: [
      // ejs模板
      {
        test: /\.ejs$/,
        loader: 'ejs-loader',
        options: {
          variable: 'data', // 可以在模板当中使用 data 进行动态渲染. 这个值可以自定义.比如:xxx
          // interpolate: '\\{\\{(.+?)\\}\\}', // 表示使用 {{}} 语法. 我们这里不需要
        },
      },
    ],
  },
  resolve: {
    // 尝试按顺序解析这些后缀名。如果有多个文件有相同的名字，但后缀名不同，webpack 会解析列在数组首位的后缀的文件 并跳过其余的后缀。
    extensions: ['.js', '.json', '.ejs'],
    alias: {
      // 添加别名，@v代表设置的路径
      '@v': resolve(__dirname, '../src/views'),
      '@api': resolve(__dirname, '../src/api'),
    },
  },
};
