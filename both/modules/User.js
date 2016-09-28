import {default as Modules} from "./modules";

/***
* create a new user
* @param {object} data - input from new user to be used for creation of user in db
****/
let _createUser = (data) => {

  if (_validateUser(data)) {

    var objUser = {
      username: data.username,
      emails: [{
        address: data.email,
        verified: false
      }],
      services: {
        password: data.password
      },
      profile: {
        configured: false
      },
      createdAt: new Date()
    };

    //create User
    if (UserContext.validate(objUser)) {
      Accounts.createUser({
        username: objUser.username,
        password: objUser.services.password,
        email: data.email,
        profile: objUser.profile
      }, function (error) {
        if (error) {
          switch (error.error) {
          case 403:
              Session.set('alreadyRegistered', true);
              break;
          }
        } else {
          //send verification e-mail
          Meteor.call( 'sendVerificationLink', ( error, response ) => {
            if ( error ) {
              console.log( error.reason, 'danger' );
            } else {
              Modules.client.displayNotice('user-created', true);
            }
          });
          //make first membership transaction
          console.log('[_createUser] call genesis transaction');
          console.log('[_createUser] for user: ' + Meteor.user()._id);
          Meteor.call ('genesisTransaction', Meteor.user()._id, function (error, response) {
            if (error) {
              console.log('[genesisTransaction] ERROR: ' + error);
            } else {
              console.log('[genesisTransaction] SUCCESS');
            };
          });
        }
      });
    } else {
      check(objUser, Schema.User);
    }
  }
}

/***
* new user input data validation
* @param {object} data - validates all keys present in data input from new user
****/
let _validateUser = (data) => {
  var val = _validateUsername(data.username)
            + Modules.both.validateEmail(data.email)
            + _validatePassword(data.password)
            + _validatePasswordMatch(data.password, data.mismatchPassword);

  if (val >= 4) { return true } else { return false };
}

/***
* password validation
* @param {string} pass - makes sure password meets criteria
****/
let _validatePassword = (pass) => {
  var val = true;
  if (pass.length < 6) {
    Session.set("invalidPassword", true);
    val = false;
  } else {
    Session.set("invalidPassword", false);
    val = true;
  }
  return val;
}

/***
* verify correct password input
* @param {string} passA - first version of password introduced in form
* @param {string} passB - second version of password introduced in form
****/
let _validatePasswordMatch = (passA, passB) => {
  Session.set("mismatchPassword", !(passA == passB));
  return (passA == passB);
}

/***
* makes sure username identifier meets criteria and is avaialble
* @param {string} username - picked username
****/
let _validateUsername = (username) => {
  //var regexp = /^[A-Za-z'-\s]+$/ Full name and surname
  var regexp = /^[a-zA-Z0-9]+$/;
  Session.set("invalidUsername", !regexp.test(username));
  if (regexp.test(username)) {
    if (Meteor.user() == null || username != Meteor.user().username) {
      Meteor.call('verifyUsername', username, function(err, id) {
        if (id == true) {
          Session.set("repeatedUsername", true);
        } else {
          Session.set("repeatedUsername", false);
        }
      });
    } else {
      Session.set("repeatedUsername", false);
    }
    if (Session.get("repeatedUsername")) {
      return false;
    }
  }
  return regexp.test(username);
}

/***
* returns information of user and updates session variable
* @param {string} userId - user id
* @param {string} sessionVar - session var to update async
****/
let _fetchUser = (userId, sessionVar) => {
  //if user profile has already been fetched: bye bye birdie!
  if (sessionVar.slice(0,7) == 'profile') {
    if (Session.get(sessionVar)) {
      return;
    }
  }
  if (userId == '0000000') {
    Session.set(sessionVar, _getAnonObject());
  } else {
    Meteor.call('getUserInfo', userId, function (error, data) {
      if (error)
        console.log(error);

        //TODO filter to deliver only what necessary
      Session.set(sessionVar, data);
    });
  }
}

/***
* returns a profile of an anonoymous user
***/
let _getAnonObject = (signatureMode) => {
  if (signatureMode) {
    return {
      _id : ANONYMOUS,
      role : ROLE_AUTHOR,
      picture : '/images/anonymous.png',
      firstName : TAPi18n.__('anonymous'),
      lastName : '',
      country :
        {
          code : '',
          name : TAPi18n.__('unknown')
        }
    };
  } else {
    return {
      _id : ANONYMOUS,
      username: 'anonymous',
      profile: {
        picture : '/images/anonymous.png',
        firstName : TAPi18n.__('anonymous'),
        lastName : '',
        country : {
          code : '',
          name : TAPi18n.__('unknown')
        }
      }
    };
  }
}

/***
* returns a profile from a given username
* @param {string} username - this one's obvious.
***/
let _getProfileFromUsername = (username) => {
  var user = _cacheSearch('username', username);
  if (user) {
    return user.profile;
  } else {
    //TODO if not found in query, request server for info
  }
  return false;
}

/***
* searches among cached session variables
* @param {string} param - paramater to look for
* @param {string} value - value of parameter
***/
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

/***
* verifies if a user is having a delegate role in a contract
* @param {object} signatures - signatures of the contract (for delegations)
* @return {boolean} status - yes or no
***/
let _userIsDelegate = (signatures) => {
  for (i in signatures) {
    //if user is delegated to
    if (signatures[i].role == ROLE_DELEGATE && signatures[i]._id == Meteor.user()._id) {
      return true;
    }
  }
  return false;
}


/***
* verifies if the vote of a user is already placed in the contract
* @param {object} ledger - ledger with transactional data of this contract
* @return {boolean} status - yes or no
***/
let _verifyVotingRight = (ledger) => {
  for (i in ledger) {
    if (ledger[i].entityId == Meteor.user()._id) {
      return false;
    }
  }
  return true;
}


/***
* verifies if a user is able to delegate
* @param {object} signatures - signatures of the contract (for delegations)
* @return {boolean} status - yes or no
***/
let _verifyDelegationRight = (signatures) => {
  for (i in signatures) {
    if (signatures[i]._id == Meteor.user()._id) {
      switch(signatures[i].role) {
        case ROLE_DELEGATOR:
          if (signatures[i].status == SIGNATURE_STATUS_PENDING) {
            return true;
          } else {
            return false;
          }
        case ROLE_DELEGATE:
          if (signatures[i].status == SIGNATURE_STATUS_PENDING) {
            return false;
          } else {
            return false;
          }
          break;
       }
    }
  }
  return false;
}

/*****
* returns vots a user has in a specific contract
* @param {object} userWallet - the wallet of the user
* @param {string} contractId - the contract to search for
* @return {number} quantity - quantity of votes in Absolute numbers
*******/
let _userVotesInContract = (userWallet, contractId) => {
  for (i in userWallet.ledger) {
    if (userWallet.ledger[i].entityId == contractId && userWallet.ledger[i].entityType == ENTITY_CONTRACT) {
      return Math.abs(userWallet.ledger[i].quantity);
    }
  }
}

/*****
* verifies if the user is a signer in the contract
* @param {object} signatures - contract signature object
* @return {boolean} bool - yes or no, that simple buddy.
*******/
let _isUserSigner = (signatures) => {
  for (i in signatures) {
    if (signatures[i]._id == Meteor.user()._id) {
      return true;
    }
  }
  return false;
}

Modules.both.isUserSigner = _isUserSigner;
Modules.both.userVotesInContract = _userVotesInContract;
Modules.both.verifyVotingRight = _verifyVotingRight;
Modules.both.verifyDelegationRight = _verifyDelegationRight;
Modules.both.userIsDelegate = _userIsDelegate;
Modules.both.getProfileFromUsername = _getProfileFromUsername;
Modules.both.getAnonymous = _getAnonObject;
Modules.both.getUserInfo = _fetchUser;
Modules.both.validateUser = _validateUser;
Modules.both.validatePassword = _validatePassword;
Modules.both.validatePasswordMatch = _validatePasswordMatch;
Modules.both.validateUsername = _validateUsername;
Modules.both.createUser = _createUser;
