document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crossChainTransferForm');


    form.addEventListener('submit', async(event) => {
        event.preventDefault();

        // 检查MetaMask是否安装
        if (window.ethereum) {
            try {
                // 请求账户授权
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0]; // 使用第一个账户

                // 创建Web3实例
                const web3 = new Web3(window.ethereum);
                // 获取表单输入数据
                const tokenId = document.getElementById('tokenId').value;
                const recipient = document.getElementById('targetChainRecipient').value;

                // 智能合约地址及ABI
                const contractAddress = '0x53Ed6649cE42Ff75D2034dd1464A70f3912C7683';
                const contractABI = [{
                        "inputs": [{
                                "internalType": "address",
                                "name": "initialOwner",
                                "type": "address"
                            },
                            {
                                "internalType": "address",
                                "name": "_targetNftContractAddress",
                                "type": "address"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "constructor"
                    },
                    {
                        "inputs": [{
                            "internalType": "address",
                            "name": "owner",
                            "type": "address"
                        }],
                        "name": "OwnableInvalidOwner",
                        "type": "error"
                    },
                    {
                        "inputs": [{
                            "internalType": "address",
                            "name": "account",
                            "type": "address"
                        }],
                        "name": "OwnableUnauthorizedAccount",
                        "type": "error"
                    },
                    {
                        "anonymous": false,
                        "inputs": [{
                                "indexed": true,
                                "internalType": "address",
                                "name": "targetNftContract",
                                "type": "address"
                            },
                            {
                                "indexed": true,
                                "internalType": "uint256",
                                "name": "tokenId",
                                "type": "uint256"
                            },
                            {
                                "indexed": false,
                                "internalType": "string",
                                "name": "tokenUri",
                                "type": "string"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "recipient",
                                "type": "address"
                            }
                        ],
                        "name": "CrossChainNFTMinted",
                        "type": "event"
                    },
                    {
                        "anonymous": false,
                        "inputs": [{
                                "indexed": true,
                                "internalType": "address",
                                "name": "originalOwner",
                                "type": "address"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "targetChainRecipient",
                                "type": "address"
                            },
                            {
                                "indexed": false,
                                "internalType": "uint256",
                                "name": "tokenId",
                                "type": "uint256"
                            },
                            {
                                "indexed": false,
                                "internalType": "string",
                                "name": "tokenUri",
                                "type": "string"
                            },
                            {
                                "indexed": false,
                                "internalType": "uint256",
                                "name": "crossChainTxId",
                                "type": "uint256"
                            }
                        ],
                        "name": "CrossChainTransfer",
                        "type": "event"
                    },
                    {
                        "anonymous": false,
                        "inputs": [{
                                "indexed": false,
                                "internalType": "uint256",
                                "name": "tokenId",
                                "type": "uint256"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "owner",
                                "type": "address"
                            }
                        ],
                        "name": "NFTBurned",
                        "type": "event"
                    },
                    {
                        "anonymous": false,
                        "inputs": [{
                                "indexed": false,
                                "internalType": "uint256",
                                "name": "tokenId",
                                "type": "uint256"
                            },
                            {
                                "indexed": false,
                                "internalType": "address",
                                "name": "originalOwner",
                                "type": "address"
                            }
                        ],
                        "name": "NFTReclaimed",
                        "type": "event"
                    },
                    {
                        "anonymous": false,
                        "inputs": [{
                                "indexed": true,
                                "internalType": "address",
                                "name": "previousOwner",
                                "type": "address"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "newOwner",
                                "type": "address"
                            }
                        ],
                        "name": "OwnershipTransferred",
                        "type": "event"
                    },
                    {
                        "inputs": [],
                        "name": "WAIT_PERIOD",
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
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        }],
                        "name": "burnNFT",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [{
                                "internalType": "uint256",
                                "name": "tokenId",
                                "type": "uint256"
                            },
                            {
                                "internalType": "address",
                                "name": "targetChainRecipient",
                                "type": "address"
                            }
                        ],
                        "name": "initiateCrossChainTransfer",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "notary",
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
                                "internalType": "uint256",
                                "name": "tokenId",
                                "type": "uint256"
                            },
                            {
                                "internalType": "string",
                                "name": "uri",
                                "type": "string"
                            },
                            {
                                "internalType": "address",
                                "name": "recipient",
                                "type": "address"
                            }
                        ],
                        "name": "reMintOnTargetChain",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [{
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        }],
                        "name": "reclaimNFT",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "renounceOwnership",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [{
                            "internalType": "address",
                            "name": "_newNotary",
                            "type": "address"
                        }],
                        "name": "setNotary",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "targetNftContractAddress",
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
                            "internalType": "address",
                            "name": "newOwner",
                            "type": "address"
                        }],
                        "name": "transferOwnership",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    }
                ];

                // 创建合约实例
                const contract = new web3.eth.Contract(contractABI, contractAddress);

                // 调用合约的initiateCrossChainTransfer方法
                await contract.methods.initiateCrossChainTransfer(tokenId, recipient).send({ from: account });

                console.log(`交易成功发起: Token ID ${tokenId} 已被 ${account} 发起跨链转移至 ${recipient}`);

                const senderAddress = ethereum.selectedAddress;
                console.log("================" + senderAddress)
                    // 构建要发送的数据对象
                const sendData = {
                    senderAddress: senderAddress,
                    tokenId: tokenId,
                    recipient: recipient

                };

                // 发送Ajax请求
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/addNFTRecord'); // 设置请求方法和URL
                xhr.setRequestHeader('Content-Type', 'application/json'); // 设置请求头
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);

                        alert(response.msg); // 显示后端返回的消息
                        // 这里可以根据后端返回的数据执行相应操作
                        // 跳转到用户界面
                        window.location.href = '/NFT'; // 假设用户界面的 URL 是 '/user'
                    } else {
                        console.error('添加用户时出错');
                        // 这里可以处理错误情况
                    }
                };
                xhr.send(JSON.stringify(sendData)); // 发送数据，需要将数据转换为JSON字符串
            } catch (error) {
                console.error('交易失败:', error);
                alert(`交易失败: ${error.message}`);
            }
        } else {
            console.log('未检测到以太坊插件，请安装MetaMask。');
            alert('未检测到以太坊插件，请安装MetaMask。');
        }




    });
});