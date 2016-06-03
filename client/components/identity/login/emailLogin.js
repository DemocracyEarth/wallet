Template.emailLogin.rendered = function () {
  Session.set("loginScreen", true);
  Session.set("invalidEmail", false);
}

Template.emailLogin.helpers({
  loginScreen: function () {
    return Session.get("loginScreen");
  },
  incorrectUser: function () {
    return Session.get("incorrectUser");
  },
  invalidEmail: function () {
    return Session.get("invalidEmail");
  }
});

Template.emailLogin.events({
  "click #signup": function (event) {
    Session.set("loginScreen", !Session.get("loginScreen"));
  },
  "click #signin-button": function (event) {
    var email = document.getElementById('signin-email').value;
    var pass = document.getElementById('signin-password').value;
    Meteor.loginWithPassword(email, pass, function (error, data) {
      if (error) {
        switch (error.error) {
          case 403:
            Session.set("incorrectUser", true)
            break;
        }
      }
      
    });
  },
  "blur #signin-password, #signin-email": function () {
    Session.set("incorrectUser", false);
  },
  "blur #signin-email": function (event) {
    if (event.target.value != '') {
      Session.set("invalidEmail", !Modules.both.validateEmail(document.getElementById('signin-email').value));
    } else {
      Session.set("invalidEmail", false);
    }
  }
});
