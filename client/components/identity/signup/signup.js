Template.signup.rendered = function () {
  //Give everyone a chance to not fuckup
  Session.set("invalidUsername", false);
  Session.set("repeatedUsername", false);
  Session.set("invalidEmail", false);
  Session.set("invalidPassword", false);
  Session.set("shortPassword", false);
  Session.set("mismatchPassword", false);
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
  }
})

Template.signup.events({
  "blur #signup-input": function (event) {
    if (event.target.value != '') {
      switch(event.target.name) {
        case "username":
          validateUsername(event.target.value);
          break;
        case "email":
          Modules.both.validateEmail(event.target.value);
          break;
        case "password":
          validatePassword(event.target.value);
          if (document.getElementsByName("mismatchPassword")[0].value != '') {
            validatePasswordMatch(document.getElementsByName("mismatchPassword")[0].value, event.target.value);
          }
          break;
        case "mismatchPassword":
          validatePasswordMatch(document.getElementsByName("password")[0].value, event.target.value);
          break;
      }
    }
  },
  "click #signup-button": function (event) {
    createNewUser(event.target.parentNode.parentNode);
  }
})


//Create

function createNewUser(data) {

  console.log(data);

  if (validateUser(data)) {

    var fullName = data.username.value.split(' '),
        givenName = fullName[0];
    var familyName = '';

    if (fullName.length > 1) {
      for (i = (fullName.length - 1); i <= 1; i--) {
        if (familyName == '') {
          familyName = fullName[i];
        } else {
          familyName = familyName + " " + fullName[i];
        }
      }
    }

    var objUser = {
      username: data.username.value,
      emails: [{
        address: data.email.value,
        verified: false
      }],
      services: {
        password: data.password.value
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
        emails: objUser.emails[0].address,
        profile: objUser.profile
      }, function (error) {
        if (error) {
          switch (error.error) {
          case 403:
              Session.set('repeatedUsername', true);
              break;
          }
        } else {

          //Fill in account
          console.log('send user email');


        }
      });
    } else {
      check(objUser, Schema.User);
    }

  } else {
    console.log('Cannot create user');
  }
}

//Validators

function validateUser (data) {
  var val = validateUsername(data.username.value)
            + Modules.both.validateEmail(data.email.value)
            + validatePassword(data.password.value)
            + validatePasswordMatch(data.password.value, data.mismatchPassword.value);

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
  /*if (pass.search(/[a-z]/i) < 0) {
    Session.set("invalidPassword", true);
    val = false;
  } else {
    if (pass.search(/[0-9]/) < 0) {
        Session.set("invalidPassword", true);
        val = false;
    } else {
      Session.set("invalidPassword", false);
      val = true;
    }
  }*/
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
