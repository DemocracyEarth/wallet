import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { animationSettings } from '/imports/ui/modules/animation';
import '/imports/ui/templates/widgets/suggest/suggest.html';

Template.suggest.onRendered(() => {
  Session.set('noMatchFound', false);
  Session.set('noCoinFound', false);

  if (!Meteor.Device.isPhone()) {
    $('.suggest').css('height', '0');
    $('.suggest').velocity({ height: '110px' }, animationSettings);
  }
});

Template.suggest.helpers({
  country() {
    if (Session.get('filteredCountries').length === 0) {
      Session.set('noMatchFound', true);
      return [{
        code: 'EA',
        emoji: '🌎',
        name: 'Earth',
      }];
    }
    Session.set('noMatchFound', false);
    return Session.get('filteredCountries');
  },
  coin() {
    if (Session.get('filteredCoins').length === 0) {
      Session.set('noCoinFound', true);
      return [{
        code: 'ETH',
        emoji: '',
        name: 'Ethereum',
      }];
    }
    Session.set('noCoinFound', false);
    return Session.get('filteredCoins');
  },
  noMatchFound() {
    return Session.get('noMatchFound');
  },
  noCoinFound() {
    return Session.get('noCoinFound');
  },
});

Template.suggest.events({
  'click #country'(event) {
    const country = {
      code: event.target.parentNode.getAttribute('value'),
      name: event.target.innerText.replace(/[^\x00-\x7F]/g, '').substring(1),
      emoji: event.target.firstChild.data,
    };
    Session.set('newCountry', country);
    Session.set('noMatchFound', false);
    Session.set('showNations', false);
  },
  'click #coin'(event) {
    const coin = {
      code: event.target.parentNode.getAttribute('value'),
      name: event.target.innerText.replace(/[^\x00-\x7F]/g, '').substring(1),
      emoji: event.target.firstChild.data,
    };
    Session.set('newCoin', coin);
    Session.set('noCoinFound', false);
    Session.set('showTokens', false);
  },
});
