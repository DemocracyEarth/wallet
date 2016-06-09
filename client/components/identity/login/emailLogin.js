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

    if (email != '' && pass != '') {
      Meteor.loginWithPassword(email, pass, function (error, data) {
        if (error) {
          switch (error.error) {
            case 403:
              Session.set("incorrectUser", true)
              break;
          }
        }
      });
    } else {
      Session.set("incorrectUser", true);
    }
  },
  "blur #signin-password, #signin-email": function () {
    Session.set("incorrectUser", false);
  },
  "click #facebook-login": function () {
    console.log('facebook');
    Meteor.loginWithFacebook({}, function(err){
      if (err) {
          throw new Meteor.Error("Facebook login failed " + err.reason);
      } 
    });
  },
  "click #twitter-login": function () {
    console.log('twitter');
  }
});
