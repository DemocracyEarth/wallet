import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

if (Meteor.isClient) {
  console.log('DEBUG - metamask.js - Meteor.isClient ');
  const loginWithMetamask = function() {
    console.log('DEBUG - metamask.js - Meteor.isClient  - loginWithMetamask');
    if (!window.web3) {
      window.alert('Please install MetaMask first.');
      return;
    }
    if (!web3) {
      // We don't know window.web3 version, so we use our own instance of web3
      // with provider given by window.web3
      web3 = new Web3(window.web3.currentProvider);
    }
    if (!web3.eth.coinbase) {
      window.alert('Please activate MetaMask first.');
      return;
    }
    const publicAddress = web3.eth.coinbase.toLowerCase();
    console.log('DEBUG - metamask.js - Meteor.isClient  - publicAddress ', publicAddress);

    var methodArguments = [{publicAddress: publicAddress}];
    
    Accounts.callLoginMethod({
      methodArguments,
      userCallback: function () {
        console.log('DEBUG - metamask.js - Meteor.isClient - callLoginMethod');
      }
    });

  }
  Accounts.registerClientLoginFunction('metamask', loginWithMetamask);
  Meteor.loginWithMetamask = function() {
    return Accounts.applyLoginFunction('metamask', arguments);
  };
}

if (Meteor.isServer) {
  console.log('DEBUG - Meteor.isServer - metamask.js');
  Accounts.registerLoginHandler('metamask', function() {
    console.log('DEBUG - metamask.js - Meteor.isServer - registerLoginHandler');
    // Look if user with current publicAddress is already present on backend

    // If yes, retrieve it. If no, create it.
    
  });
}
