import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './collective.html';

Template.collective.helpers({
  title() {
    if (Session.get('collective') !== undefined) {
      return Session.get('collective').name;
    }
  },
  description() {
    if (Session.get('collective') !== undefined) {
      return Session.get('collective').profile.bio;
    }
  },
  picture() {
    if (Session.get('collective') !== undefined) {
      return Session.get('collective').profile.logo;
    }
    return 'images/earth-avatar.png';
  },
  hasLogo() {
    if (Session.get('collective') !== undefined) {
      return (Session.get('collective').profile.logo !== undefined);
    }
  },
});
