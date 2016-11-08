import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './blockchainLogin.html';

Template.blockchainLogin.events({
  "click .qr-sign": function (event) {
    Meteor.loginWithPassword('napoleonDynamite', 'xdwcqc');
  }
});
