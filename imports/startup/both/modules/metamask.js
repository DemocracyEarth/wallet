import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Web3 } from 'meteor/ethereum:web3'
import ethUtil from 'ethereumjs-util';


if (Meteor.isClient) {
  const handleSignMessage = (publicAddress, nonce) => {
    return new Promise((resolve, reject) =>
      web3.personal.sign(
        web3.fromUtf8(`I am signing my one-time Democracy Earth nonce: ${nonce}`),
        publicAddress,
        function (err, signature) {
          if (err) return reject(err);
          return resolve({ signature });
        }
      )
    );
  }

  const verifySignature = function(signature, publicAddress, nonce) {
    const msg = `I am signing my one-time Democracy Earth nonce: ${nonce}`;

    // Perform an elliptic curve signature verification with ecrecover
    const msgBuffer = ethUtil.toBuffer(msg);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = ethUtil.toBuffer(signature.signature);
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(
      msgHash,
      signatureParams.v,
      signatureParams.r,
      signatureParams.s
    );
    const addressBuffer = ethUtil.publicToAddress(publicKey);
    const address = ethUtil.bufferToHex(addressBuffer);

    // The signature verification is successful if the address found with
    // ecrecover matches the initial publicAddress
    if (address.toLowerCase() === publicAddress.toLowerCase()) {
      return 'success';
    } else {
      return res
        .status(401)
        .send({ error: 'Signature verification failed' });
    }
  }

  const loginWithMetamask = function() {
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

    var nonce = Math.floor(Math.random() * 10000);
    const publicAddress = web3.eth.coinbase.toLowerCase();
    
    handleSignMessage(publicAddress, nonce).then(function (signature){
      var verification =  verifySignature(signature, publicAddress, nonce);
      
      if (verification == 'success') {
        var methodName = 'login';
        var methodArguments = [{publicAddress: publicAddress}];
        Accounts.callLoginMethod({
          methodArguments,
          userCallback: function (err) {
            Accounts._pageLoadLogin({
              type: 'metamask',
              allowed: !err,
              error: err,
              methodName: methodName,
              methodArguments: methodArguments
            })
          }
        });
      } else {
        console.log('Login error with Metamask');
      }
    })
  }
  
  Accounts.registerClientLoginFunction('metamask', loginWithMetamask);

  Meteor.loginWithMetamask = function() {
    return Accounts.applyLoginFunction('metamask', arguments);
  };
}

if (Meteor.isServer) {
  Accounts.registerLoginHandler('metamask', function(opts) {
    const publicAddress = opts.publicAddress;
    var user = null;
    var userQuery = Meteor.users.find({username: publicAddress}).fetch();
    var serviceUserId = {}
    
    // Check if user with current publicAddress already exists
    if(userQuery.length == 0) {
      // If not, create it
      user = Accounts.updateOrCreateUserFromExternalService('metamask', {
        id: publicAddress,
        publicAddress: publicAddress
      });
      serviceUserId = {userId: user.userId};
    } else {
      // Otherwise, retrieve it
      user = userQuery;
      serviceUserId = {userId: user[0]._id};
    }
    return serviceUserId;
  });
}
