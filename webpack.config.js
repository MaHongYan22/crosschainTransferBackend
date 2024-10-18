const path = require('path');

module.exports = {
    entry: '/public/app.js', // 你的主JavaScript文件
    output: {
        path: path.resolve(__dirname, 'dist'), // 打包后的文件输出目录
        filename: 'bundle.js' // 打包后的文件名
    },
    mode: 'development', // 设置模式为开发模式
};