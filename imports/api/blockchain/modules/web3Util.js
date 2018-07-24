import Web3 from 'web3';

// Set web3 provider
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // TODO - set HttpProvider() argument as config setting variable
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

/**
* @summary gets eth balance from given public address
* @param {string} publicAddress
* @return {object} bigNumber eth balance
*/
const _getEthBalance = (publicAddress) => {
  let balance = web3.eth.getBalance(publicAddress);
  let ethBalance = web3.fromWei(balance, 'ether');
  return ethBalance;
};

/**
* @summary gets wei balance from given public address
* @param {string} publicAddress
* @return {object} bigNumber wei balance
*/
const _getWeiBalance = (publicAddress) => {
  let balance = web3.eth.getBalance(publicAddress);
  return balance;
};

export const getEthBalance = _getEthBalance;
export const getWeiBalance = _getWeiBalance;