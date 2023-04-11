import Web3 from "web3"
import { account } from "./types"
const logger = require('./logger')
const delay = ms => new Promise((resolve, reject) => setTimeout(resolve, ms))
const abi: any = [
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "addresses",
                "type": "address[]"
            }
        ],
        "name": "batchCheckBalance",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "addr",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "balance",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct balanceResponseItem[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "addrs",
                "type": "address[]"
            }
        ],
        "name": "batchEthTransfrom",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
export const batchCrateAccount = (num: number) => {
    let web3 = new Web3()
    let accounts: account[] = []
    for (let i = 0; i < num; i++) {
        let account = web3.eth.accounts.create()
        accounts.push({
            address: account.address,
            privateKey: account.privateKey,
            isDone: 0
        })
        logger.createAccountLogger.info(`创建成功，地址：${account.address} 私钥：${account.privateKey}`)
    }
    return accounts
}

export const batchTransfer = async (amount: number, accounts: account[], privateKey: string) => {
    return new Promise(async (resolve) => {
        const web3 = new Web3(
            new Web3.providers.HttpProvider("https://base-goerli.public.blastapi.io")
        )
        let addresses = accounts.map(item => {
            return item.address
        })
        let account = web3.eth.accounts.privateKeyToAccount(privateKey)
        let contract = new web3.eth.Contract(abi, "0x5A05b4f27bCec274b6201d2899d17982E9027aA2")
        let encodeData = contract.methods.batchEthTransfrom(web3.utils.toBN(amount * 10 ** 18), addresses).encodeABI()
        let gasPrice = await web3.eth.getGasPrice()
        let gas
        try {
            gas = await web3.eth.estimateGas({
                from: account.address,
                to: "0x5A05b4f27bCec274b6201d2899d17982E9027aA2",
                value: web3.utils.toBN(amount * addresses.length * 10 ** 18),
                data: encodeData
            })
        } catch (error) {
            console.log(`批量转账失败，失败原因${error.message}`)
            resolve(false)
            return
        }
        let signTx = await web3.eth.accounts.signTransaction({
            from: account.address,
            data: encodeData,
            to:"0x5A05b4f27bCec274b6201d2899d17982E9027aA2",
            gas: gas,
            value:web3.utils.toBN(amount * addresses.length * 10 ** 18),
            gasPrice: Math.round(Number(gasPrice) * 1.2)

        }, privateKey)
        web3.eth.sendSignedTransaction(signTx.rawTransaction).then(res => {
            console.log(`批量转账成功`)
            resolve(true)
        }).catch(err => {
            console.log(`批量转账，失败原因${err.message}`)
            resolve(false)
        })
    })
}

export const bridge = (amount: number, privateKey: string) => {
    return new Promise(async (resolve) => {
        const web3 = new Web3(
            new Web3.providers.HttpProvider("https://rpc.ankr.com/eth_goerli")
        )
        let account = web3.eth.accounts.privateKeyToAccount(privateKey)
        let encodeData = web3.eth.abi.encodeParameters(["address", "uint256", "uint64", "bool", "bytes"], [account.address, web3.utils.toBN(amount), 100000, false, "0x"])
        encodeData = "0xe9e05c42" + encodeData.replace("0x", "")
        let gasPrice = await web3.eth.getGasPrice()
        let signTx = await web3.eth.accounts.signTransaction({
            from: account.address,
            data: encodeData,
            value:web3.utils.toBN(amount),
            to: "0xe93c8cd0d409341205a592f8c4ac1a5fe5585cfa",
            gas: 100000,
            gasPrice: Math.round(Number(gasPrice) * 1.2)

        }, privateKey)
        web3.eth.sendSignedTransaction(signTx.rawTransaction).then(res => {
            console.log(`跨链成功`)
            const web3 = new Web3(
                new Web3.providers.HttpProvider("https://base-goerli.public.blastapi.io")
            )
            const getBalance = async () => {
                let balance = await web3.eth.getBalance(account.address)
                console.log(`当前账户余额 ${Number(balance) / (10 ** 18)}，跨链需要时间，请不要关闭窗口`)
                if (Number(balance) >= Number(amount) + Number(0.03*10**18)) {
                    resolve(true)
                } else {
                    await delay(2000)
                    getBalance()
                }
            }
            getBalance()
        }).catch(err => {
            console.log(`跨链转账，失败原因${err.message}`)
            resolve(false)
        })
    })

}