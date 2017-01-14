import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import './emailLogin.html';
import './forgotPassword.js';
import './socialMediaLogin.js';
import '../signup/signup.js';
import '../../../widgets/warning/warning.js';

Template.emailLogin.rendered = function rendered() {
  Session.set("loginScreen", true);
  Session.set("passwordKnown", true);
  Session.set("invalidEmail", false);
}

Template.emailLogin.helpers({
  loginScreen: function () {
    return Session.get("loginScreen");
  },
  passwordKnown: function () {
    return Session.get("passwordKnown");
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
  "click #forgot-pw": function (event) {
    Session.set("passwordKnown", !Session.get("passwordKnown"));
  },
  "click #signin-button, submit #email-signin-form": function (event) {
    event.preventDefault();
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
    Meteor.loginWithFacebook({}, function(err){
      if (err) {
          throw new Meteor.Error("Facebook login failed " + err.reason);
      }
    });
  },
  "click #twitter-login": function () {
    Meteor.loginWithTwitter({}, function(err){
      if (err) {
          throw new Meteor.Error("Twitter login failed " + err.reason);
      }
    });
  }
});
