document.getElementById('redeemForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // 检查window.ethereum是否可用，这是MetaMask注入到网页的全局变量
    if (window.ethereum) {
        try {
            // 请求用户的账户地址
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];

            // 创建一个Web3实例并连接到MetaMask
            const web3 = new Web3(window.ethereum);

            // 获取用户输入的Token ID
            var tokenId = document.getElementById('tokenId').value;

            // 设置智能合约的地址和ABI
            const contractAddress = '0x53Ed6649cE42Ff75D2034dd1464A70f3912C7683'; // 你的合约地址
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

            // 创建智能合约的实例
            const contract = new web3.eth.Contract(contractABI, contractAddress);

            // 发送交易调用智能合约的方法
            contract.methods.reclaimNFT(tokenId).send({ from: account })
                .on('transactionHash', function(hash) {
                    console.log('交易哈希值:', hash);
                    alert('交易哈希值: ' + hash);
                })
                .on('receipt', function(receipt) {
                    console.log('交易收据:', receipt);
                    alert('交易成功! 交易收据: ' + receipt.transactionHash);
                })
                .on('error', function(error, receipt) {
                    console.error('交易错误:', error);
                    if (receipt) {
                        console.error('交易收据:', receipt);
                    }
                    alert('交易失败: ' + error.message);
                });

        } catch (error) {
            console.error('错误:', error);
            alert('错误: ' + error.message);
        }
    } else {
        alert('请安装MetaMask!');
    }
});