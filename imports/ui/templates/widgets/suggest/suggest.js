import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { animationSettings } from '/imports/ui/modules/animation';
import './suggest.html';

Template.suggest.onRendered(() => {
  Session.set('noMatchFound', false);

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
  noMatchFound() {
    return Session.get('noMatchFound');
  },
});

Template.suggest.events({
  'click #country'(event) {
    const country = {
      code: event.target.parentNode.getAttribute('value'),
      name: event.target.innerText.slice(4),
      emoji: event.target.firstChild.data,
    };
    if (country.name === 'arth') {
      country.name = 'Earth';
    }
    Session.set('newCountry', country);
    Session.set('noMatchFound', false);
    Session.set('showNations', false);
  },
});
