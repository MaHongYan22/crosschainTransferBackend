const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pool = require('./db');
const Web3 = require('web3');
const app = express();
const port = 3000;
app.use(express.static('public'));

app.set('view engine', 'ejs');
const path = require('path');
const { error } = require('console');
app.set('views', path.join(__dirname, 'views'));
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); // for parsing cookies

const privateKeyMap = {
    '0x3c1612fde154ca8cf7996a1ac2a4c7026f2b0ed0': '0x4644a684b33b24c8c64b949dd266df8fc3a916661f285def78301d3cb2c85187',
    '0xe70ba76a7fa459e5c846ebff2de397335a4fd539': '0xcc6f44d4a16afc359d1c259cb2e3a7c6ab05ab9c546f0ea01d4cb7b5f37119cf',
    '0xcf693E7424B83ecC0AcD57D304739D64983F7BaD': '0xf1a097da9742aa375ddd0b2f89907b588ba38b5b0633910a49144686256d5bbc'
};

function formatDateTime(isoString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(isoString).toLocaleString('zh-CN', options);
}

app.use(session({
    secret: '39d8c7fe53e6b4e601abc123', // 用来对session id相关的cookie进行签名
    resave: false, // 强制保存session即使它并没有变化
    saveUninitialized: true // 强制将未初始化的session存储
        // 更多选项根据需要设置
}));

// 登录拦截器中间件
function checkLogin(req, res, next) {
    console.log("开始检查登陆状态")

    if (req.session.loggedIn) { // 假设在登录成功后设置了req.session.loggedIn
        next(); // 如果用户已登录，继续下一个中间件或请求处理
    } else {
        res.render('login'); // 如果用户未登录，重定向到登录页面

    }
}




// 应用登录拦截器中间件到index界面
app.get('/', checkLogin, (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

// 登录路由，登录成功后设置session
app.post('/login', (req, res) => {
    console.log("登录请求")
    const account = req.body.account;
    const password = req.body.password;
    console.log(account)
    console.log(password)

    // 参数化查询，防止SQL注入
    const query = 'SELECT * FROM user WHERE username = ? AND password = ?';

    pool.query(query, [account, password], (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }

        if (results.length > 0) {
            console.log("找到了")

            console.log(results[0].id)
            const userid = results[0].id;

            // 将用户名保存到Cookie中，设置过期时间为一天
            res.cookie('userid', userid, { maxAge: 86400000 });

            // 找到匹配的用户
            res.json({ code: 1, msg: 'Login successful' });
            req.session.loggedIn = true; // 设置session标记为已登录
        } else {
            // 未找到匹配的用户
            console.log("没找到")
            res.json({ code: 0, msg: 'Login fail' });
        }
    });
});



// 获取最新的交易记录
app.get('/latest-transaction', (req, res) => {
    console.log("====================== ===")
    const sql = 'SELECT * FROM ft_transaction ORDER BY create_time DESC LIMIT 1';
    pool.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching the latest transaction:', err);
            return res.status(500).send('Error fetching the latest transaction');
        }
        // 打印查询到的结果
        console.log('Latest Transaction:', result);

        if (result.length > 0) {
            res.json(result[0]); // 只返回最新的记录
        } else {
            res.status(404).send('No transactions found');
        }
    });
});

// 处理调用合约的请求
app.post('/withdraw', async(req, res) => {

    console.log("进入奖励交易方法")
    const { senderAddress, ethAmount } = req.body;
    const scaledEthAmount = (parseFloat(ethAmount) * 0.01).toString();
    // 检查传入的地址是否在私钥映射表中
    const privateKey = privateKeyMap[senderAddress];
    if (!privateKey) {
        return res.status(400).json({ success: false, message: 'Sender address is not recognized.' });
    }



    const contractAddress = '0xff7792a540fCaA0edfA4aEf948Fe42B7491454f0'; // 替换为实际合约地址
    const contractABI = [{
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [{
                "internalType": "address",
                "name": "_notary",
                "type": "address"
            }],
            "name": "addNotary",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getBalance",
            "outputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "address",
                "name": "",
                "type": "address"
            }],
            "name": "isNotary",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "lastCaller",
            "outputs": [{
                "internalType": "address",
                "name": "",
                "type": "address"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }],
            "name": "notaryAddresses",
            "outputs": [{
                "internalType": "address",
                "name": "",
                "type": "address"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [{
                "internalType": "address",
                "name": "",
                "type": "address"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "address payable",
                    "name": "_to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "_amount",
                    "type": "uint256"
                }
            ],
            "name": "withdrawETH",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "stateMutability": "payable",
            "type": "receive"
        }
    ]; // 替换为实际合约 ABI

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    try {
        const weiAmount = web3.utils.toWei(scaledEthAmount, 'ether');
        // 创建交易对象
        const tx = {
            to: contractAddress,
            gas: 2000000,
            data: contract.methods.withdrawETH(senderAddress, weiAmount).encodeABI(),
        };

        // 使用私钥签名交易
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

        // 发送签名的交易
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        res.json({ success: true, transactionHash: receipt.transactionHash });
    } catch (error) {
        console.error('Error during contract method call:', error);
        res.status(500).send({ success: false, message: error.message });
    }
});



app.post('/user', (req, res) => {
    console.log("用户查询请求")
    const id = req.cookies.userid;
    console.log("session 中的id" + id)


    // 参数化查询，防止SQL注入
    const query = 'SELECT * FROM account WHERE available=1 AND user_id = ?';




    pool.query(query, id, (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }

        if (results.length > 0) {
            console.log("找到了")
            console.log(results)
            res.json(results);
        }
    });
});
app.post('/userRecord', (req, res) => {
    console.log("用户查询请求")
    const id = req.cookies.userid;
    console.log("session 中的id" + id)


    // 参数化查询，防止SQL注入
    const query = 'SELECT * FROM user_record WHERE available=1 AND user_id = ?';




    pool.query(query, id, (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }

        if (results.length > 0) {
            console.log("找到了")
            console.log(results)
            res.json(results);
        }
    });
});

app.post('/userSearch', (req, res) => {
    console.log("用户条件查询请求")
    const account = req.body.start;

    const chain_id = req.body.end;
    const params = [];

    // 参数化查询，防止SQL注入
    let query = 'SELECT * FROM account WHERE available=1';
    if (account) {
        query += " AND address = ?";
        params.push(account);
    }

    if (chain_id) {
        query += " AND chain_id = ?";
        params.push(chain_id);
    }


    console.log(query)
    pool.query(query, params, (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }

        if (results.length > 0) {
            console.log("找到了")
            console.log(results)
            res.json({ code: 1, data: results });
        } else {

            console.log("没找到")
            res.json({ code: 0, msg: '没有符合条件数据' })
        }
    });
});
app.post('/userDelete', (req, res) => {
    console.log("用户删除请求")
    const id = req.body.id;


    // 参数化查询，防止SQL注入
    let sqlDel = 'update account set available = 0 where id=?';


    console.log(sqlDel)

    pool.query(sqlDel, id, (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }
        if (results.changedRows > 0) {
            console.log("成功")
            res.json({ code: 1, msg: '删除成功' });
        } else {

            console.log("失败")
            res.json({ code: 0, msg: '删除失败' })
        }

    });
});
app.post('/ftRecordDelete', (req, res) => {
    console.log("用户删除交易记录请求")
    const id = req.body.id;


    // 参数化查询，防止SQL注入
    let sqlDel = 'update ft_transaction set available = 0 where id=?';


    console.log(sqlDel)

    pool.query(sqlDel, id, (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }
        if (results.changedRows > 0) {
            console.log("成功")
            res.json({ code: 1, msg: '删除成功' });
        } else {

            console.log("失败")
            res.json({ code: 0, msg: '删除失败' })
        }

    });
});
app.post('/nftRecordDelete', (req, res) => {
    console.log("用户删除交易记录请求")
    const id = req.body.id;
    console.log(id)

    // 参数化查询，防止SQL注入
    let sqlDel = 'update nft_transaction set available = 0 where transaction_id=?';


    console.log(sqlDel)

    pool.query(sqlDel, id, (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }
        if (results.changedRows > 0) {
            console.log("成功")
            res.json({ code: 1, msg: '删除成功' });
        } else {

            console.log("失败")
            res.json({ code: 0, msg: '删除失败' })
        }

    });
});




app.post('/userDeleteMore', (req, res) => {
    console.log("用户条件查询请求")
    const ids = req.body.ids;
    console.log(ids)
    const idsArray = ids.split(',').map(id => parseInt(id.trim()));
    const placeholders = idsArray.map(() => '?').join(','); // 创建参数占位符字符串
    const sqlUpdate = `UPDATE account SET available = 0 WHERE id IN (${placeholders})`;

    pool.query(sqlUpdate, idsArray, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error updating user availability.');
        }
        console.log('Updated Rows:', result.affectedRows);
        if (result.changedRows > 0) {
            console.log("成功")
            res.json({ code: 1, msg: '删除成功' });
        } else {

            console.log("失败")
            res.json({ code: 0, msg: '删除失败' })
        }
    });

});
app.post('/contentSearch', (req, res) => {
    const status = req.body.status;
    console.log(status)
    const recipientAddress = req.body.recipientAddress;

    const page = req.body.page;
    const pagesize = req.body.pagesize;
    const user_id = req.cookies.userid;
    console.log(user_id)
    const params = [];

    let sqlSearch = "SELECT * FROM ft_transaction WHERE available = 1";
    if (user_id) {
        sqlSearch += " AND user_id = ?";
        params.push(user_id);
    }

    if (status) {
        sqlSearch += ` AND  status like '%${status}%'`;
    }

    if (recipientAddress) {
        sqlSearch += " AND recipientAddress = ?";
        params.push(recipientAddress);
    }

    sqlSearch += ` ORDER BY create_time DESC LIMIT ${(page - 1) * pagesize}, ${pagesize}`;

    console.log(sqlSearch);

    pool.query(sqlSearch, params, (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }

        if (results.length > 0) {
            console.log("找到了")
            console.log(results)
                // 格式化每条记录的 create_time 字段
            const formattedResults = results.map(record => ({
                ...record,
                create_time: formatDateTime(record.create_time)
            }));
            res.json({ code: 1, data: formattedResults });
        } else {

            console.log("没找到")
            res.json({ code: 0, msg: '没有符合条件数据' })
        }
    });

});
app.post('/contentPage', (req, res) => {
    const status = req.body.status;
    console.log(status)
    const recipientAddress = req.body.recipientAddress;
    const user_id = req.cookies.userid;
    console.log(user_id)
    const params = [];

    let sqlCount = "SELECT COUNT(*) AS count FROM ft_transaction WHERE available = 1";
    if (user_id) {
        sqlCount += " AND user_id = ?";
        params.push(user_id);
    }
    if (status) {
        sqlCount += ` AND  status like '%${status}%'`;
    }

    if (recipientAddress) {
        sqlCount += " AND recipientAddress = ?";
        params.push(recipientAddress);
    }

    console.log(sqlCount);
    pool.query(sqlCount, params, (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }

        if (results.length > 0) {
            console.log("找到了")
            console.log(results)
            res.json({ code: 1, data: results });
        } else {

            console.log("没找到")
            res.json({ code: 0, msg: '没有符合条件数据' })
        }
    });

});
app.post('/NTransactionSearch', (req, res) => {
    const token_id = req.body.token_id;
    console.log(token_id)
    const recipientAddress = req.body.recipientAddress;
    console.log(recipientAddress)
    const page = req.body.page;
    const pagesize = req.body.pagesize;
    const user_id = req.cookies.userid;
    const params = [];

    let sqlSearch = "SELECT * FROM nft_transaction WHERE available = 1";

    if (user_id) {
        sqlSearch += " AND user_id = ?";
        params.push(user_id);
    }
    if (token_id) {
        sqlSearch += ` AND  token_id = ?`;
        params.push(token_id);
    }

    if (recipientAddress) {
        sqlSearch += " AND recipientAddress = ?";
        params.push(recipientAddress);
    }

    sqlSearch += ` ORDER BY create_time DESC LIMIT ${(page - 1) * pagesize}, ${pagesize}`;

    console.log(sqlSearch);

    pool.query(sqlSearch, params, (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }

        if (results.length > 0) {
            console.log("找到了")
            console.log(results)
            const formattedResults = results.map(record => ({
                ...record,
                create_time: formatDateTime(record.create_time)
            }));
            res.json({ code: 1, data: formattedResults });
        } else {

            console.log("没找到")
            res.json({ code: 0, msg: '没有符合条件数据' })
        }
    });

});
app.post('/userRecordSearch', (req, res) => {
    const transactionId = req.body.transactionId;
    console.log(transactionId)
    const sort = req.body.sort;
    console.log(sort)
    const page = req.body.page;
    const pagesize = req.body.pagesize;
    const user_id = req.cookies.userid;
    const params = [];

    let sqlSearch = "SELECT * FROM user_record WHERE available = 1";

    if (user_id) {
        sqlSearch += " AND user_id = ?";
        params.push(user_id);
    }
    if (transactionId) {
        sqlSearch += ` AND  transactionId = ?`;
        params.push(transactionId);
    }

    if (sort) {
        sqlSearch += " AND status = ?";
        params.push(sort);
    }

    sqlSearch += ` ORDER BY createTime DESC LIMIT ${(page - 1) * pagesize}, ${pagesize}`;

    console.log(sqlSearch);

    pool.query(sqlSearch, params, (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }

        if (results.length > 0) {
            console.log("找到了")
            console.log(results)
            const formattedResults = results.map(record => ({
                ...record,
                create_time: formatDateTime(record.create_time)
            }));
            res.json({ code: 1, data: formattedResults });
        } else {

            console.log("没找到")
            res.json({ code: 0, msg: '没有符合条件数据' })
        }
    });

});
app.post('/NTransactionPage', (req, res) => {
    const token_id = req.body.token_id;
    console.log(token_id)
    const recipientAddress = req.body.recipientAddress;
    const user_id = req.cookies.userid;
    const params = [];

    let sqlCount = "SELECT COUNT(*) AS count FROM nft_transaction WHERE available = 1";
    if (user_id) {
        sqlCount += " AND user_id = ?";
        params.push(user_id);
    }
    if (token_id) {
        sqlCount += " AND token_id = ?";
        params.push(token_id);
    }


    if (recipientAddress) {
        sqlCount += " AND recipientAddress = ?";
        params.push(recipientAddress);
    }

    console.log(sqlCount);
    pool.query(sqlCount, params, (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }

        if (results.length > 0) {
            console.log("找到了")
            console.log(results)
            res.json({ code: 1, data: results });
        } else {

            console.log("没找到")
            res.json({ code: 0, msg: '没有符合条件数据' })
        }
    });

});
app.post('/userRecordPage', (req, res) => {
    const transactionId = req.body.transactionId;
    console.log(transactionId)
    const sort = req.body.sort;
    const user_id = req.cookies.userid;
    const params = [];

    let sqlCount = "SELECT COUNT(*) AS count FROM user_record WHERE available = 1";
    if (transactionId) {
        sqlCount += " AND transactionId = ?";
        params.push(transactionId);
    }
    if (sort) {
        sqlCount += " AND status = ?";
        params.push(sort);
    }


    if (user_id) {
        sqlCount += " AND user_id = ?";
        params.push(user_id);
    }

    console.log(sqlCount);
    pool.query(sqlCount, params, (error, results) => {
        if (error) {
            // 处理查询错误
            console.error(error);


        }

        if (results.length > 0) {
            console.log("找到了")
            console.log(results)
            res.json({ code: 1, data: results });
        } else {

            console.log("没找到")
            res.json({ code: 0, msg: '没有符合条件数据' })
        }
    });

});
app.post('/addUser', (req, res) => {
    const account = req.body.account;
    console.log(account)
    const chainId = req.body.chainId;
    console.log(chainId)

    const user_id = req.cookies.userid;
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const params = [];
    params.push(chainId);
    params.push(account);
    params.push(user_id);
    params.push(currentTime);

    let sqlAdd = "insert into account(chain_id,address,user_id,update_time) values(?,?,?,?)";
    pool.query(sqlAdd, params, (error, results) => {
        if (error) {
            console.error('数据插入失败：', error);
            res.status(500).send('数据插入失败');
            return;
        }

        console.log('用户数据插入成功');;
        res.status(200).json({ msg: '数据插入成功' });
    });

});


app.post('/addFtRecord', (req, res) => {
    const senderAddress = req.body.senderAddress;
    console.log(senderAddress)
    const symbol = req.body.symbol;
    console.log(symbol)
    const toChainID = req.body.toChainID;
    console.log(toChainID)
    const recipientAddress = req.body.to;
    console.log(recipientAddress)
    const valueEth = req.body.valueEth;
    console.log(valueEth)
    const sendChainId = 1337;
    const receiptChainId = 11155111;
    const user_id = req.cookies.userid;
    const status = "交易已发送"
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const params = [];



    params.push(senderAddress);
    params.push(recipientAddress);
    params.push(status);
    params.push(sendChainId);
    params.push(receiptChainId);
    params.push(valueEth);
    params.push(currentTime);
    params.push(user_id);




    let sqlAddRecord = "insert into ft_transaction(senderAddress,recipientAddress,status,send_chain_id,recipient_chain_id,amount,create_time,user_id) values(?,?,?,?,?,?,?,?)";
    pool.query(sqlAddRecord, params, (error, results) => {
        if (error) {
            console.error('数据插入失败：', error);
            res.status(500).send('数据插入失败');
            return;
        }

        console.log('用户数据插入成功');;
        res.status(200).json({ msg: '交易已成功发送' });
    });

});
app.post('/addNFTRecord', (req, res) => {
    const senderAddress = req.body.senderAddress;
    console.log(senderAddress)
    const recipient = req.body.recipient;
    console.log(recipient)
    const sendChainId = 1337;
    const status = "交易已发送"
    const receiptChainId = 11155111;
    const user_id = req.cookies.userid;
    const tokenId = req.body.tokenId;
    console.log(tokenId)
    const NFT_Address = "0x1F3f34F8e75e87Fb2311ae7Ab6C085fbd1539e76"
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const params = [];


    params.push(senderAddress);
    params.push(recipient);
    params.push(sendChainId);
    params.push(status);
    params.push(receiptChainId);
    params.push(tokenId);
    params.push(NFT_Address)
    params.push(currentTime);
    params.push(user_id);

    let sqlAddRecord = "insert into nft_transaction(senderAddress,recipientAddress,sender_chain_id,status,recipient_chain_id,token_id,NFT_Address,create_time,user_id) values(?,?,?,?,?,?,?,?,?)";
    pool.query(sqlAddRecord, params, (error, results) => {
        if (error) {
            console.error('数据插入失败：', error);
            res.status(500).send('数据插入失败');
            return;
        }

        console.log('用户数据插入成功');;
        res.status(200).json({ msg: '交易已成功发送' });
    });

});




app.get('/getUserInfo', (req, res) => {
    const userid = req.cookies.userid;
    console.log(userid)
    let sqlSelect = "select * from user where available = 1 and id = ?"

    pool.query(sqlSelect, userid, (error, results) => {
        if (error) {
            console.error('查询失败', error);
            res.status(500).send('数据查询失败');
            return;
        }

        console.log('用户数据查询成功');;
        res.status(200).json(results);
    });
});
app.post('/updateUser', (req, res) => {
    console.log("触发修改密码调用")


    const { username, password, age } = req.body;

    // 更新数据库中的用户信息
    const sql = `UPDATE user SET password = '${password}', age = ${age} WHERE username = '${username}'`;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error('Error updating user: ' + err.stack);
            res.status(500).json({ error: 'An error occurred while updating user.' });
            return;
        }
        console.log('User updated:', result.affectedRows);
        res.json({ message: 'User updated successfully.' });
    });

});
app.get('/index', (req, res) => {
    res.render('index', { title: '首页' });
});
app.get('/user', (req, res) => {
    res.render('user', { title: '用户' });
});
app.get('/record', (req, res) => {
    res.render('userRecord', { title: '用户交易追踪' });
});
app.get('/FT', (req, res) => {
    res.render('FT_Transaction', { title: '同质化代币转移' });
});
app.get('/NFT', (req, res) => {
    res.render('NFT_Transaction', { title: '非同质化代币转移' });
});
app.get('/userAdd', (req, res) => {
    res.render('userAdd', { title: '用户添加账户' });
});
app.get('/updatePassword', (req, res) => {
    res.render('updatePassword', { title: '用户修改密码' });
});
app.get('/crosschainView', (req, res) => {
    res.render('crosschainView', { title: '用户发起同质化资产转移' });
});
app.get('/viewToken', (req, res) => {
    res.render('viewToken', { title: '用户查看转移资产是否重铸成功' });
});
app.get('/withdrawETH', (req, res) => {
    res.render('withdrawETH', { title: '奖励交易发起' });
});
app.get('/reclaimNFT', (req, res) => {
    res.render('reclaimNFT', { title: '用户请求退还NFT' });
});
app.get('/NFTapprove', (req, res) => {
    res.render('NFTapprove', { title: '用户授权跨链合约操作权' });
});
app.get('/NFTcrosschain', (req, res) => {
    res.render('NFTcrosschain', { title: '用户发起NFT的跨链交易' });
});
app.get('/logout', (req, res) => {
    res.render('login', { title: '用户退出登录' });
});
app.get('/', (req, res) => {
    // 这里是从数据库查询数据的伪代码
    pool.query('SELECT * FROM account', (error, results) => {
        if (error) {
            return res.send(error);
        }
        console.log(results)
            // 将查询结果传递给EJS模板
        res.render('index', { accounts: results });
    });
});



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});