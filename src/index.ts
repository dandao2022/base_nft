import Web3 from "web3"
import { batchCrateAccount, bridge, batchTransfer } from "./account"
import { account } from "./types"
const delay = ms => new Promise((resolve, reject) => setTimeout(resolve, ms))
import { generatorContract } from "./createContract"
const start = async (num: number, privateKey: string) => {
    console.log("任务开始")
    let accounts: account[] = batchCrateAccount(num)
    let bridgeResult = await bridge(Number((num * 0.022 + 0.03).toFixed(2)) * 10 ** 18, privateKey)
    if (!bridgeResult) {
        console.log("跨链失败")
        return
    }
    let batchTransferResult = await batchTransfer(0.022, accounts, privateKey)
    if (!batchTransferResult) {
        console.log("批量转账失败")
        return
    }
    await delay(10000)
    for (let item of accounts) {
        await generatorContract(item.privateKey)
    }
    console.log("完成")
}
start(10, "0x") //第一个是数量，第二个是私钥