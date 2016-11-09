import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './collective.html';

Template.collective.helpers({
  title: function () {
    if (Session.get('collective') !== undefined) {
      return Session.get('collective').name;
    }
  },
  description: function () {
    if (Session.get('collective') !== undefined) {
      return Session.get('collective').profile.bio;
    }
  },
  picture: function () {
    if (Session.get('collective') !== undefined) {
      return Session.get('collective').profile.logo;
    }
    return 'images/earth-avatar.png';
  },
  hasLogo: function () {
    if (Session.get('collective') !== undefined) {
      return (Session.get('collective').profile.logo !== undefined)
    }
  }
})
