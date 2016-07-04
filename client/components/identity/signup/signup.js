Template.signup.rendered = function () {
  var enableLogin = false;

  //Give everyone a chance to not fuckup
  Session.set("invalidUsername", false);
  Session.set("repeatedUsername", false);
  Session.set("invalidEmail", false);
  Session.set("invalidPassword", false);
  Session.set("shortPassword", false);
  Session.set("mismatchPassword", false);
  Session.set("alreadyRegistered", false);

}

Template.signup.helpers({
  invalidUsername: function () {
    return Session.get("invalidUsername");
  },
  repeatedUsername: function () {
    return Session.get("repeatedUsername");
  },
  invalidEmail: function() {
    return Session.get("invalidEmail");
  },
  invalidPassword: function () {
    return Session.get("invalidPassword");
  },
  shortPassword: function () {
    return Session.get("shortPassword");
  },
  mismatchPassword: function () {
    return Session.get("mismatchPassword");
  },
  alreadyRegistered: function () {
    return Session.get("alreadyRegistered");
  }
})

Template.signup.events({
  "focus #signup-input": function () {
    Session.set('alreadyRegistered', false);
  },
  "blur #signup-input": function (event) {
    if (event.target.value != '') {
      switch(event.target.name) {
        case "username-signup":
          validateUsername(event.target.value);
          break;
        case "email-signup":
          Modules.both.validateEmail(event.target.value);
          break;
        case "password-signup":
          validatePassword(event.target.value);
          if (document.getElementsByName("mismatchPassword")[0].value != '') {
            validatePasswordMatch(document.getElementsByName("mismatchPassword")[0].value, event.target.value);
          }
          break;
        case "mismatchPassword":
          validatePasswordMatch(document.getElementsByName("password-signup")[0].value, event.target.value);
          break;
      }
    }
  },
  "click #signup-button": function (event) {
    var userData = {
      username: document.getElementsByName('username-signup')[0].value,
      email: document.getElementsByName('email-signup')[0].value,
      password: document.getElementsByName('password-signup')[0].value,
      mismatchPassword: document.getElementsByName('mismatchPassword')[0].value
    }
    createNewUser(userData);
  }
})


//Create

function createNewUser(data) {

  if (validateUser(data)) {

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

//Validators

function validateUser (data) {
  var val = validateUsername(data.username)
            + Modules.both.validateEmail(data.email)
            + validatePassword(data.password)
            + validatePasswordMatch(data.password, data.mismatchPassword);

  if (val >= 4) { return true } else { return false };
}



function validatePassword(pass) {
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

function validatePasswordMatch (passA, passB) {
  Session.set("mismatchPassword", !(passA == passB));
  return (passA == passB);
}

function validateUsername (username) {
  //var regexp = /^[A-Za-z'-\s]+$/ Full name and surname
  var regexp = /^[a-zA-Z0-9]+$/;
  Session.set("invalidUsername", !regexp.test(username));
  if (regexp.test(username)) {
    Meteor.call('verifyUsername', username, function(err, id) {
      if (id == true) {
        Session.set("repeatedUsername", true);
      } else {
        Session.set("repeatedUsername", false);
      }
    });

    if (Session.get("repeatedUsername")) {
      return false;
    }
  }
  return regexp.test(username);
}
