Template.emailLogin.rendered = function () {
  Session.set("loginScreen", true);

  //Give everyone a chance to not fuckup
  Session.set("invalidUsername", false);
  Session.set("invalidEmail", false);
  Session.set("invalidPassword", false);
  Session.set("shortPassword", false);
  Session.set("mismatchPassword", false);
}

Template.emailLogin.helpers({
  loginScreen: function () {
    return Session.get("loginScreen");
  },
  invalidUsername: function () {
    return Session.get("invalidUsername");
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
});

Template.emailLogin.events({
  "click #signup": function (event) {
    Session.set("loginScreen", !Session.get("loginScreen"));
  },
  "submit #signup-new-user": function (event) {
    event.preventDefault();
    createNewUser(event.target);
  },
  "blur #signup-input": function (event) {
    switch(event.target.name) {
      case "username":
        validateUsername(event.target.value);
        break;
      case "email":
        validateEmail(event.target.value);
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
});


function createNewUser(data) {
  if (validateUser(data)) {
    console.log('REGISTER');
  } else {
    console.log('ERROR');
  }
}

function validateUser (data) {
  var val = validateUsername(data.username.value)
            + validateEmail(data.email.value)
            + validatePassword(data.password.value)
            + validatePasswordMatch(data.password.value, data.mismatchPassword.value);

  if (val >= 4) { return true } else { return false };
}

function validateUsername (username) {
  var val = /^[0-9a-zA-Z_.-]+$/;
  Session.set("invalidUsername", !val.test(username));
  return val.test(username);
}

function validateEmail (email) {
  var val = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  Session.set("invalidEmail", !val.test(email));
  return val.test(email);
}

function validatePassword(pass) {
  var val = true;
  if (pass.length < 6) {
    Session.set("shortPassword", true);
    val = false;
  } else {
    Session.set("shortPassword", false);
    val = true;
  }
  if (pass.search(/[a-z]/i) < 0) {
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
  }
  return val;
}

function validatePasswordMatch (passA, passB) {
  Session.set("mismatchPassword", !(passA == passB));
  return (passA == passB);
}
