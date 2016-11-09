import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './blockchainLogin.html';

Template.blockchainLogin.events({
  'click .qr-sign'() {
    Meteor.loginWithPassword('napoleonDynamite', 'xdwcqc');
  },
});
