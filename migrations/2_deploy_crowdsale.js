/* global artifacts, web3 */
var MiniMeTokenFactory = artifacts.require('./token/MiniMeTokenFactory.sol')
var SwarmToken = artifacts.require('./token/SwarmToken.sol')
var SwarmCrowdsale = artifacts.require('./crowdsale/SwarmCrowdsale.sol')
var MultiSigWallet = artifacts.require('./multisig/MultiSigWallet.sol')

let factory
let token
let crowdsale
let wallet

module.exports = function (deployer, network, accounts) {
  let multisigAddress = '0x8bf7b2d536d286b9c5ad9d99f608e9e214de63f0'

  deployer.then(function () {
    return deployer.deploy(MultiSigWallet, [accounts[0], accounts[1], accounts[2]], 2)
  }).then(function () {
    return MultiSigWallet.deployed()
  }).then((deployedWallet) => {
    wallet = deployedWallet

    // Deploy the factory
    return deployer.deploy(MiniMeTokenFactory)
  }).then(function () {
      // Get the deployed factory
    return MiniMeTokenFactory.deployed()
  }).then((deployedFactory) => {
    // Save off the factory
    factory = deployedFactory

    // Deploy the token
    return deployer.deploy(SwarmToken, factory.address)
  }).then(() => {
    // Get the deployed token
    return SwarmToken.deployed()
  }).then((deployedToken) => {
    // Save off the token
    token = deployedToken

    // Deploy the crowd sale with params
    let startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 10000
    let endTime = startTime + 50000

    console.log('startTime', startTime)
    console.log('endTime', endTime)

    // USD Rate for tokens
    let rate = 300

    // Deploy the crowd sale
    return deployer.deploy(SwarmCrowdsale, startTime, endTime, rate, wallet.address, token.address, 0)
  }).then(function () {
    // Get the deployed crowd sale
    return SwarmCrowdsale.deployed()
  }).then(function (deployedSale) {
    // Save off the deployed crowdsale
    crowdsale = deployedSale

    // Set the owner of the token to the crowdsale contract to allow minting
    console.log('Changing controller address for token')
    return token.changeController(crowdsale.address)
  })

  // .then(() => {

  //   // Initialize the crowdsale so that initial tokens are assigned
  //   console.log('Initializing crowdsale')
  //   return crowdsale.initializeToken()
  // }).then(() => {
  //   // Set the multisig address as the owner
  //   return crowdsale.transferOwnership(multisigAddress)
  // })
}
