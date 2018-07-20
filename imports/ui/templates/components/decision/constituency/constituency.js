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
  Session.set('suggestDisplay', '');
});

Template.constituency.helpers({
  showNations() {
    return (Session.get('suggestDisplay') === 'NATION');
  },
  showTokens() {
    return (Session.get('suggestDisplay') === 'TOKEN');
  },
  country() {
    if (Session.get('newCountry') !== undefined) {
      return Session.get('newCountry').name;
    }
    return undefined;
  },
  token() {
    if (Session.get('newCoin') !== undefined) {
      return Session.get('newCoin').name;
    }
    return undefined;
  },
});

Template.constituency.events({
  'click #cancel-constituency'() {
    const draft = Session.get('draftContract');
    if (!draft.constituency || draft.constituency.length === 0) {
      draft.constituencyEnabled = false;
      Session.set('draftContract', draft);
    }
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
    Session.set('suggestDisplay', 'NATION');
  },
  'focus .login-input-domain'() {
    Session.set('suggestDisplay', '');
  },
  'focus .token-search'() {
    Session.set('suggestDisplay', 'TOKEN');
  },
});
