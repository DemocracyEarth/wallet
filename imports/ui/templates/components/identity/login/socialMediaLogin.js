import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { displayLogin } from '/imports/ui/modules/popup';

Template.socialMediaLogin.events({
  "click #facebook-login": function () {
    Meteor.loginWithFacebook({}, function(err){
      if (err.reason) {
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
  },
  "click #agora-login": function (event) {
    displayLogin(event, document.getElementById('loggedUser'));
  }
})
