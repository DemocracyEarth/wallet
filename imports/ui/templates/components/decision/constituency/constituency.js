import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { animatePopup } from '/imports/ui/modules/popup';
import { searchJSON } from '/imports/ui/modules/JSON';
import { geo } from '/lib/geo';
import { token } from '/lib/token';

import '/imports/ui/templates/components/decision/constituency/constituency.html';

Template.constituency.onCreated(() => {
  Session.set('showNations', false);
  Session.set('showTokens', false);
});

Template.constituency.helpers({
  showNations() {
    return Session.get('showNations');
  },
  showTokens() {
    return Session.get('showTokens');
  },
  country() {
    if (Session.get('newCountry') !== undefined) {
      return Session.get('newCountry').name;
    }
    return undefined;
  },
  token() {
    if (Session.get('newToken') !== undefined) {
      return Session.get('newToken').name;
    }
    return undefined;
  },
});

Template.constituency.events({
  'click #cancel-constituency'() {
    animatePopup();
  },
  'click #execute-constituency'() {

  },
  'input .country-search'(event) {
    if (event.target.value !== '') {
      Session.set('filteredCountries', searchJSON(geo.country, event.target.value));
    } else {
      Session.set('filteredCountries', geo.country);
    }
  },
  'input .token-search'(event) {
    if (event.target.value !== '') {
      Session.set('filteredCoins', searchJSON(token.coin, event.target.value));
    } else {
      Session.set('filteredCoins', token.coin);
    }
  },
  'focus .country-search'() {
    Session.set('showNations', true);
  },
  'focus .login-input-split-right'() {
    Session.set('showNations', false);
    Session.set('showTokens', false);
  },
  'focus .token-search'() {
    Session.set('showTokens', true);
  },
});
