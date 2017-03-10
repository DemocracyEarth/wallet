import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { check } from 'meteor/check';

import { UserContext, User } from '/imports/api/users/User';
import { displayNotice } from '/imports/ui/modules/notice';
import { genesisTransaction } from '/imports/api/transactions/transaction';
import { validateEmail } from './validations.js';

/**
* @summary Create a new user
* @param {object} data - input from new user to be used for creation of user in db
*/
const _createUser = (data) => {
  let createUserPromise;
  if (_validateUser(data)) {
    const objUser = {
      username: data.username,
      emails: [{
        address: data.email,
        verified: false,
      }],
      services: {
        password: data.password,
      },
      profile: {
        configured: false,
      },
      createdAt: new Date(),
    };

    if (UserContext.validate(objUser)) {

      createUserPromise = new Promise(function (resolve, reject) {
        Accounts.createUser({
          username: objUser.username,
          password: objUser.services.password,
          email: objUser.emails[0].address,
          profile: objUser.profile,
        }, function (error, result) {
          if (error) {
            return reject(error);
          }
          // send verification e-mail
          Meteor.call('sendVerificationLink', (verificationError) => {
            if (verificationError) {
              console.log(verificationError.reason, 'danger');
            } else {
              displayNotice('user-created', true);
            }
          });
          // make first membership transaction
          genesisTransaction(Meteor.user()._id);
          return resolve(result);
        });
      });
    } else {
      // BUG Shema is not defined. When updating = error:  existingKey.indexOf is not a function
      check(objUser, User);
    }
  }
  return createUserPromise;
};

/**
* @summary new user input data validation
* @param {object} data - validates all keys present in data input from new user
*/
let _validateUser = (data) => {
  const validUsername = _validateUsername(data.username);

  var val = !validUsername.valid
            + validateEmail(data.email)
            + _validatePassword(data.password)
            + _validatePasswordMatch(data.password, data.mismatchPassword);

  if (val >= 4) { return true } else { return false };
};

/**
* @summary password validation
* @param {string} pass - makes sure password meets criteria
*/
let _validatePassword = (pass) => {
  let val = true;
  if (pass.length < 6) {
    Session.set('invalidPassword', true);
    val = false;
  } else {
    Session.set('invalidPassword', false);
    val = true;
  }
  return val;
};

/**
* @summary verify correct password input
* @param {string} passA - first version of password introduced in form
* @param {string} passB - second version of password introduced in form
*/
let _validatePasswordMatch = (passA, passB) => {
  Session.set('mismatchPassword', !(passA === passB));
  return (passA === passB);
};

/**
* @summary makes sure username identifier meets criteria and is avaialble
* @param {string} username - picked username
*/
let _validateUsername = (username) => {
  const usernameValidationObject = {
    valid: false,
    repeated: false,
  };

  const regexp = /^[a-zA-Z0-9]+$/;

  // Set whether username format is valid or not
  usernameValidationObject.valid = !regexp.test(username);

  // Only if username is valid, check whether it exists already
  if (regexp.test(username)) {
    if (Meteor.user() === null || username !== Meteor.user().username) {
      if (Meteor.users.findOne({ username: username }) !== undefined) {
        usernameValidationObject.repeated = true;
      } else {
        usernameValidationObject.repeated = false;
      }
    }
  }

  return usernameValidationObject;
};

/**
* @summary returns a profile of an anonoymous user
*/
const _getAnonObject = (signatureMode) => {
  if (signatureMode) {
    return {
      _id: '0000000',
      role: 'AUTHOR',
      picture: '/images/anonymous.png',
      firstName: TAPi18n.__('anonymous'),
      lastName: '',
      country:
      {
        code: '',
        name: TAPi18n.__('unknown'),
      },
    };
  }
  return {
    _id: '0000000',
    username: 'anonymous',
    profile: {
      picture: '/images/anonymous.png',
      firstName: TAPi18n.__('anonymous'),
      lastName: '',
      country: {
        code: '',
        name: TAPi18n.__('unknown'),
      },
    },
  };
};

/**
* @summary returns a profile from a given username
* @param {string} username - this one's obvious.
*/
const _getProfileFromUsername = (username) => {
  var user = _cacheSearch('username', username);
  if (user) {
    return user.profile;
  } else {
    //TODO if not found in query, request server for info
  }
  return false;
};

/**
* @summary searches among cached session variables
* @param {string} param - paramater to look for
* @param {string} value - value of parameter
*/
let _cacheSearch = (param, value) => {
  var session = Session.keys;
  for (key in Session.keys) {
    if (key.slice(0,7) == 'profile') {
      var json = JSON.parse(Session.keys[key]);
      if (json[param] == value) {
        return json;
      }
    }
  }
  return false;
}

/**
* @summary verifies if a user is having a delegate role in a contract
* @param {object} signatures - signatures of the contract (for delegations)
* @return {boolean} status - yes or no
*/
const _userIsDelegate = (signatures) => {
  for (i in signatures) {
    //if user is delegated to
    if (signatures[i].role === 'DELEGATE' && signatures[i]._id === Meteor.user()._id) {
      return true;
    }
  }
  return false;
};


/**
* @summary verifies if the vote of a user is already placed in the contract
* @param {object} ledger - ledger with transactional data of this contract
* @return {boolean} status - yes or no
*/
const _verifyVotingRight = (ledger) => {
  if (Meteor.user() != null) {
    for (const i in ledger) {
      if (ledger[i].entityId === Meteor.user()._id) {
        return false;
      }
    }
    return true;
  }
  return false;
};


/**
* @summary verifies if a user is able to delegate
* @param {object} signatures - signatures of the contract (for delegations)
* @return {boolean} status - yes or no
*/
let _verifyDelegationRight = (signatures) => {
  if (Meteor.user() != null) {
    for (i in signatures) {
      if (signatures[i]._id == Meteor.user()._id) {
        switch(signatures[i].role) {
          case 'DELEGATOR':
            if (signatures[i].status === 'PENDING') {
              return true;
            } else {
              return false;
            }
          case 'DELEGATE':
            if (signatures[i].status === 'PENDING') {
              return false;
            } else {
              return false;
            }
            break;
         }
      }
    }
    return false;
  } else {
    return false;
  }
}

/**
* @summary returns vots a user has in a specific contract
* @param {object} userWallet - the wallet of the user
* @param {string} contractId - the contract to search for
* @return {number} quantity - quantity of votes in Absolute numbers
*/
const _userVotesInContract = (userWallet, contractId) => {
  let totalVotes = 0;
  // if (userWallet === undefined) { return undefined; }
  for (const i in userWallet.ledger) {
    if (userWallet.ledger[i].entityId === contractId && userWallet.ledger[i].entityType === 'CONTRACT') {
      switch (userWallet.ledger[i].transactionType) {
        case 'OUTPUT':
          totalVotes += parseInt(userWallet.ledger[i].quantity, 10);
          break;
        case 'INPUT':
        default:
          totalVotes -= parseInt(userWallet.ledger[i].quantity, 10);
          break;
      }
    }
  }
  return totalVotes;
};

/**
* @summary verifies if the user is a signer in the contract
* @param {object} signatures - contract signature object
* @return {boolean} bool - yes or no, that simple buddy.
*/
let _isUserSigner = (signatures) => {
  for (i in signatures) {
    if (signatures[i]._id === Meteor.user()._id) {
      return true;
    }
  }
  return false;
};

export const isUserSigner = _isUserSigner;
export const userVotesInContract = _userVotesInContract;
export const verifyVotingRight = _verifyVotingRight;
export const verifyDelegationRight = _verifyDelegationRight;
export const userIsDelegate = _userIsDelegate;
export const getProfileFromUsername = _getProfileFromUsername;
export const getAnonymous = _getAnonObject;
export const validateUser = _validateUser;
export const validatePassword = _validatePassword;
export const validatePasswordMatch = _validatePasswordMatch;
export const validateUsername = _validateUsername;
export const createUser = _createUser;
