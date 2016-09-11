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

    //Create User
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

          //Fill in account
          Meteor.call( 'sendVerificationLink', ( error, response ) => {
            if ( error ) {
              console.log( error.reason, 'danger' );
            } else {
              Modules.client.displayNotice('user-created', true);
            }
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
    if (username != Meteor.user().username) {
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

Modules.both.validateUser = _validateUser;
Modules.both.validatePassword = _validatePassword;
Modules.both.validatePasswordMatch = _validatePasswordMatch;
Modules.both.validateUsername = _validateUsername;
Modules.both.createUser = _createUser;
