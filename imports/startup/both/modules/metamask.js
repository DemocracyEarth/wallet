import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { TAPi18n } from 'meteor/tap:i18n';
import Web3 from 'web3';
import ethUtil from 'ethereumjs-util';

let web3;

if (Meteor.isClient) {
  /**
  * @summary check web3 plugin and connects to code obejct
  */
  const _setWeb3 = () => {
    if (!window.web3) {
      window.alert(TAPi18n.__('metamask-install'));
      return;
    }
    if (!web3) {
      // We don't know window.web3 version, so we use our own instance of web3
      // with provider given by window.web3
      web3 = new Web3(window.web3.currentProvider);
    }
    if (!web3.eth.coinbase) {
      window.alert(TAPi18n.__('metamask-activate'));
      return;
    }
  };

  const handleSignMessage = (publicAddress) => {
    return new Promise((resolve, reject) => {
      web3.personal.sign(
        web3.fromUtf8(`${TAPi18n.__('metamask-sign-nonce').replace('{{collectiveName}}', Meteor.settings.public.Collective.name)}`),
        publicAddress,
        function (err, signature) {
          if (err) return reject(err);
          return resolve({ signature });
        }
      );
    });
  };

  const verifySignature = (signature, publicAddress) => {
    const msg = `${TAPi18n.__('metamask-sign-nonce').replace('{{collectiveName}}', Meteor.settings.public.Collective.name)}`;
    let res;

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
    }
    return res
      .status(401)
      .send({ error: TAPi18n.__('metamask-sign-fail') });
  };

  /**
  * @summary updates user profile with metamask balance
  */
  const _syncBalance = () => {
    if (Meteor.user()) {
      console.log(web3.eth.coinbase);
      console.log(web3.eth.getBalance(web3.eth.coinbase, function (error, result) {
        if (!error) {
          console.log(JSON.stringify(result));
        } else {
          console.error(error);
        }
      }));
    }
  };

  const loginWithMetamask = () => {
    _setWeb3();
    // _syncBalance();

    const nonce = Math.floor(Math.random() * 10000);
    const publicAddress = web3.eth.coinbase.toLowerCase();

    handleSignMessage(publicAddress, nonce).then(function (signature) {
      const verification = verifySignature(signature, publicAddress, nonce);

      if (verification === 'success') {
        const methodName = 'login';
        const methodArguments = [{ publicAddress }];
        Accounts.callLoginMethod({
          methodArguments,
          userCallback: (err) => {
            Accounts._pageLoadLogin({
              type: 'metamask',
              allowed: !err,
              error: err,
              methodName,
              methodArguments,
            });
          },
        });
      } else {
        console.log(TAPi18n.__('metamask-login-error'));
      }
    });
  };

  Accounts.registerClientLoginFunction('metamask', loginWithMetamask);

  Meteor.loginWithMetamask = function () {
    return Accounts.applyLoginFunction('metamask', arguments);
  };
}

if (Meteor.isServer) {
  Accounts.registerLoginHandler('metamask', function (opts) {
    const publicAddress = opts.publicAddress;
    let user = null;
    const userQuery = Meteor.users.find({ username: publicAddress }).fetch();
    let serviceUserId = {};

    // Check if user with current publicAddress already exists
    if (userQuery.length === 0) {
      // If not, create it
      user = Accounts.updateOrCreateUserFromExternalService('metamask', {
        id: publicAddress,
        publicAddress,
      });
      serviceUserId = { userId: user.userId };
    } else {
      // Otherwise, retrieve it
      user = userQuery;
      serviceUserId = { userId: user[0]._id };
    }
    return serviceUserId;
  });

  Accounts.onLogin(function (loginObject) {
    if (loginObject.type !== 'resume') {
      Meteor.call('loadUserTokenBalance', loginObject.user._id, (subsidyError) => {
        if (subsidyError) {
          console.log(subsidyError, 'danger');
        }
      });
    }
  });
}
