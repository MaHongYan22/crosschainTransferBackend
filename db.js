const mysql = require('mysql');

// 创建连接池以便重用连接
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'crosschain'
});

module.exports = pool;