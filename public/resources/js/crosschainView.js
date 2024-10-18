let web3;
window.addEventListener('load', () => {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
    } else {
        console.error("MetaMask is not installed!");
    }
});

document.getElementById('connectWallet').addEventListener('click', async() => {
    try {
        // Request account access if needed
        await ethereum.request({ method: 'eth_requestAccounts' });
        // Acccounts now exposed, update UI
        document.getElementById('connectWallet').textContent = 'Connected';
        document.getElementById('connectWallet').disabled = true;
    } catch (error) {
        console.error(error);
    }
});

document.getElementById('transact').addEventListener('click', async() => {
    const symbol = document.getElementById('symbol').value;
    const toChainID = document.getElementById('toChainID').value;
    const to = document.getElementById('to').value;
    const valueEth = document.getElementById('value').value;



    // Assume you have the contract ABI and Address
    const contractABI = [{
            "inputs": [{
                "internalType": "string",
                "name": "_NATIVE",
                "type": "string"
            }],
            "stateMutability": "payable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "address",
                    "name": "src",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "dst",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "LogBirdge_Refund_COIN",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": false,
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint64",
                    "name": "fromChainID",
                    "type": "uint64"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint64",
                    "name": "toChainID",
                    "type": "uint64"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "LogBridge_SwapOut",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [{
                    "internalType": "uint64",
                    "name": "ChainID",
                    "type": "uint64"
                },
                {
                    "internalType": "uint8",
                    "name": "num",
                    "type": "uint8"
                },
                {
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                }
            ],
            "name": "ADD_ChainID_TO_NAME",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "ERC20_CONTRACT_ADDRESS",
                    "type": "address"
                }
            ],
            "name": "ADD_NEW_ERC20",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "string",
                "name": "symbol",
                "type": "string"
            }],
            "name": "Bridge_ERC20_Balance",
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
                "internalType": "uint64",
                "name": "",
                "type": "uint64"
            }],
            "name": "ChainID_TO_NAME",
            "outputs": [{
                "internalType": "string",
                "name": "",
                "type": "string"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "uint64",
                    "name": "ChainID",
                    "type": "uint64"
                },
                {
                    "internalType": "uint8",
                    "name": "num",
                    "type": "uint8"
                }
            ],
            "name": "DELETE_ChainID_TO_NAME",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "string",
                "name": "symbol",
                "type": "string"
            }],
            "name": "DELETE_ERC20",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{
                "internalType": "string",
                "name": "",
                "type": "string"
            }],
            "name": "ERC20_CONTRACT",
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
            "name": "FromChainID",
            "outputs": [{
                "internalType": "uint64",
                "name": "",
                "type": "uint64"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint64",
                    "name": "toChainID",
                    "type": "uint64"
                }
            ],
            "name": "NATIVE_ETH_cross_transfer",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "uint64",
                    "name": "",
                    "type": "uint64"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "SYMBOL",
            "outputs": [{
                "internalType": "string",
                "name": "",
                "type": "string"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "name": "balance_of_deopsit",
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
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "internalType": "uint64",
                    "name": "toChainID",
                    "type": "uint64"
                }
            ],
            "name": "check_legally",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "string",
                    "name": "a",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "b",
                    "type": "string"
                }
            ],
            "name": "compare_string",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "deposit",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "internalType": "uint64",
                    "name": "toChainID",
                    "type": "uint64"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "general_corss_transfer",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "internalType": "address payable",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "general_transfer",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "receipt",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [{
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "withdraw",
            "outputs": [{
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }],
            "stateMutability": "payable",
            "type": "function"
        }
    ];
    const contractAddress = '0xd0Ce030ee3331A5e80f5AA89cF1e12b20eac4f86';

    // Create contract instance
    const contract = new web3.eth.Contract(contractABI, contractAddress);


    // 将ETH值转换为Wei值

    const valueInWei = web3.utils.toHex(web3.utils.toWei(valueEth, "finney"))
    console.log(valueInWei)
        // Assume 'transfer' is your contract method
    const data = contract.methods.general_corss_transfer(symbol, toChainID, to, valueEth).encodeABI();

    const transactionParameters = {

        from: ethereum.selectedAddress,
        to: contractAddress,
        data: data,
        value: valueInWei,
    };

    try {
        // Send transaction
        const txHash = await ethereum.request({

            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });
        console.log('Transaction Hash:', txHash);
        // Handle the transaction confirmation here
    } catch (error) {
        console.error('Transaction failed:', error);
        window.location.href = '/FT';
        return;

    }
    const senderAddress = ethereum.selectedAddress;
    console.log("================" + senderAddress)
        // 构建要发送的数据对象
    const sendData = {
        senderAddress: senderAddress,
        symbol: symbol,
        toChainID: toChainID,
        to: to,
        valueEth: valueEth
    };

    // 发送Ajax请求
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/addFtRecord'); // 设置请求方法和URL
    xhr.setRequestHeader('Content-Type', 'application/json'); // 设置请求头
    xhr.onload = function() {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);

            alert(response.msg); // 显示后端返回的消息
            // 这里可以根据后端返回的数据执行相应操作
            // 跳转到用户界面
            window.location.href = '/FT'; // 假设用户界面的 URL 是 '/user'
        } else {
            console.error('添加用户时出错');
            // 这里可以处理错误情况
        }
    };
    xhr.send(JSON.stringify(sendData)); // 发送数据，需要将数据转换为JSON字符串



});