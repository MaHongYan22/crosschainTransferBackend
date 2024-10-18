// 检测到页面加载完毕时
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否安装了MetaMask
    if (typeof window.ethereum !== 'undefined') {
        document.getElementById('connectWallet').addEventListener('click', async() => {
            try {
                // 请求连接MetaMask
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                document.getElementById('balance').textContent = 'Wallet Connected';
            } catch (error) {
                console.error('An error occurred:', error);
                document.getElementById('balance').textContent = 'Error connecting to MetaMask';
            }
        });
    } else {
        document.getElementById('balance').textContent = 'MetaMask is not installed!';
    }
});

document.getElementById('getBalance').addEventListener('click', async() => {
    if (window.ethereum) {
        const account = document.getElementById('accountAddress').value;
        if (account === '') {
            document.getElementById('balance').textContent = 'Please enter an account address.';
            return;
        }

        const web3 = new Web3(window.ethereum);
        const contractABI = [{
                "inputs": [{
                        "internalType": "uint256",
                        "name": "initialSupply",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "Cross_Bridge",
                        "type": "address"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [{
                        "indexed": true,
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "Approval",
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
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "Transfer",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "CrossChain_bridge",
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
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "spender",
                        "type": "address"
                    }
                ],
                "name": "allowance",
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
                    },
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "allowed",
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
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "approve",
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
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }],
                "name": "balanceOf",
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
                "name": "balances",
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
                    "name": "value",
                    "type": "uint256"
                }],
                "name": "burnt",
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
                "name": "crossED_transfer",
                "outputs": [{
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "decimals",
                "outputs": [{
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "name",
                "outputs": [{
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "symbol",
                "outputs": [{
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalSupply",
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
                        "name": "recipient",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "transfer",
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
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "recipient",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "transferFrom",
                "outputs": [{
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];
        const contractAddress = "0x500305aBA37a4caa10A7Be02826e2fc93f2B6FF7";
        const tokenContract = new web3.eth.Contract(contractABI, contractAddress);

        try {
            // 调用合约的balanceOf方法
            const balance = await tokenContract.methods.balanceOf(account).call();
            document.getElementById('balance').textContent = `Balance: ${web3.utils.fromWei(balance, 'ether')} tokens`;
        } catch (error) {
            console.error(error);
            document.getElementById('balance').textContent = 'Error fetching balance';
        }
    } else {
        document.getElementById('balance').textContent = 'MetaMask is not installed!';
    }
});