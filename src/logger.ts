const path = require('path')
const log4js = require('koa-log4')
log4js.configure({
    appenders: {
        createAccount: {
            type: 'dateFile',
            pattern: '-yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            encoding: 'utf-8',
            filename: path.join(__dirname, 'logs', 'createAccount') 
        },
        createContract: {
            type: 'dateFile',
            pattern: '-yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            encoding: 'utf-8',
            filename: path.join(__dirname, 'logs', 'createContract') 
        },
        out: {
            type: 'console'
        }
    },
    categories: {
        default: { appenders: ['out'], level: 'info' },
        createAccount: { appenders: ['createAccount'], level: 'info' },
        createContract: { appenders: ['createContract'], level: 'info' },
    }
})
module.exports = {
    createAccountLogger: log4js.getLogger('createAccount'),
    createContractLogger: log4js.getLogger('createContract'),
}