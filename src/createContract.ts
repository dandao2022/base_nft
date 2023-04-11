import Web3 from "web3"
const logger = require('./logger')
export const generatorContract = (privateKey) => {
    return new Promise(async (resolve) => {
        const web3 = new Web3(
            new Web3.providers.HttpProvider("https://base-goerli.public.blastapi.io")
        )
        let account = web3.eth.accounts.privateKeyToAccount(privateKey)
        let contract = new web3.eth.Contract([{ "constant": false, "inputs": [{ "name": "num", "type": "uint256" }], "name": "test1", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "test2", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }])
        contract.options.data = "608060405234801561001057600080fd5b50600160008190555060e7806100276000396000f3006080604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806319ae899414604e57806366e41cb7146078575b600080fd5b348015605957600080fd5b5060766004803603810190808035906020019092919050505060a0565b005b348015608357600080fd5b50608a60b2565b6040518082815260200191505060405180910390f35b80600080828254019250508190555050565b600080549050905600a165627a7a7230582042fa822fa9daeedbd358fbdb7ab600df0b4024a9a32ca4221e297bec099c2c460029";
        let encodeData = contract.deploy({
            data: '0x608060405234801561001057600080fd5b50600160008190555060e7806100276000396000f3006080604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806319ae899414604e57806366e41cb7146078575b600080fd5b348015605957600080fd5b5060766004803603810190808035906020019092919050505060a0565b005b348015608357600080fd5b50608a60b2565b6040518082815260200191505060405180910390f35b80600080828254019250508190555050565b600080549050905600a165627a7a7230582042fa822fa9daeedbd358fbdb7ab600df0b4024a9a32ca4221e297bec099c2c460029',
            arguments: []
        }).encodeABI()
        let gasPrice = await web3.eth.getGasPrice()
        let gas
        try {
            gas = await web3.eth.estimateGas({
                from: account.address,
                data: encodeData
            })
        } catch (error) {
            console.log(`合约创建是失败，失败原因${error.message}`)
            resolve(false)
            return
        }
        let signTx = await web3.eth.accounts.signTransaction({
            from: account.address,
            data: encodeData,
            gas: gas,
            gasPrice: Math.round(Number(gasPrice) * 1.2)

        }, privateKey)
        web3.eth.sendSignedTransaction(signTx.rawTransaction).then(res => {
            console.log(`合约创建成功，合约地址${res.contractAddress}`)
            logger.createContractLogger.info(`合约创建成功，创建地址：${account.address}，私钥：${privateKey}，合约地址${res.contractAddress}`)
            resolve(true)
        }).catch(err => {
            console.log(`合约创建是失败，失败原因${err.message}`)
            resolve(false)
        })
    })
}