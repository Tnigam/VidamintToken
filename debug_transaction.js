const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

const tx = '0xbfca79e1b3a9f189e0291325ba4d0f35473555d029fc35e9177a146830e09da4'

web3.eth.getTransaction(tx, (err, result) => {
    console.log(result.from)
})

web3.eth.getTransactionReceipt(tx, (err, result) => {
    console.log(JSON.stringify(result, null ,2))
})