import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { validateEmail } from '/imports/startup/both/modules/validations.js';
import { validatePassword, validatePasswordMatch, createUser, validateUsername } from '/imports/startup/both/modules/User.js';
import './signup.html';
import '../../../widgets/warning/warning.js';

Template.signup.onRendered = function onReder() {
  let enableLogin = false;

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
          validateEmail(event.target.value);
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
    createUser(userData);
  }
})
