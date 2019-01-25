/*

_____                                                   ______           _   _
|  __ \                                                 |  ____|         | | | |
| |  | | ___ _ __ ___   ___   ___ _ __ __ _  ___ _   _  | |__   __ _ _ __| |_| |__
| |  | |/ _ \ '_ ` _ \ / _ \ / __| '__/ _` |/ __| | | | |  __| / _` | '__| __| '_ \
| |__| |  __/ | | | | | (_) | (__| | | (_| | (__| |_| |_| |___| (_| | |  | |_| | | |
|_____/ \___|_| |_| |_|\___/ \___|_|  \__,_|\___|\__, (_)______\__,_|_|   \__|_| |_/
                                                  __/ |
                                                 |___/

"You never change things by fighting the existing reality. To change something
build a new model that makes the existing model obsolete."
Buckminster Fuller, Great San Francisco Architect.

A Roma, <3

*/

/* global alert */

import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { SearchSource } from 'meteor/meteorhacks:search-source';
import { Template } from 'meteor/templating';


import { toggleSidebar } from '/imports/ui/modules/menu';
import { globalObj } from '/lib/global';
import { geo } from '/lib/geo';
import { token } from '/lib/token';
import { gui } from '/lib/const';


import '/imports/ui/templates/layout/main.html';
import '/imports/ui/templates/widgets/modal/modal';
import '/imports/ui/templates/widgets/popup/popup';
import '/imports/ui/templates/layout/sidebar/sidebar';
import '/imports/ui/templates/layout/navigation/navigation';
import '/imports/ui/templates/layout/response/verifyEmail/verifyEmail';
import '/imports/ui/templates/layout/touchmenu/touchmenu';
import '/imports/ui/templates/components/decision/editor/editor';

/*
* head content
*/
const _head = () => {
  const icon = $('<link>', {
    rel: 'shortcut icon',
    type: 'image/x-icon',
    href: `${Meteor.settings.public.Collective.profile.logo}`,
  });
  const mobile = $('<link>', {
    rel: 'apple-touch-icon',
    href: `${Meteor.settings.public.Collective.profile.logo}`,
  });

  $('head').append(icon);
  $('head').append(mobile);
};


Meteor.startup(() => {
  // setup language
  Session.set('showLoadingIndicator', true);

  // internationalization library
  TAPi18n.setLanguage(Meteor.settings.public.app.language)
    .done(function () {
      Session.set('showLoadingIndicator', false);
    })
    .fail(function (errorMessage) {
      console.log(errorMessage);
    });

  // scripts
  // $.getScript('js/datepicker.js', () => {});

  // head
  _head();

  // time
  Meteor.setInterval(function () {
    Meteor.call('getServerTime', function (error, result) {
      Session.set('time', result);
    });
  }, 60000);

  // search Engine for Tags
  Session.set('createTag', false);
  globalObj.TagSearch = new SearchSource('tags', ['text', 'url'], {
    keepHistory: 1000 * 60 * 5,
    localSearch: true,
  });

  // search Engine for Proposals
  Session.set('createProposal', false);
  globalObj.ProposalSearch = new SearchSource('contracts', ['title', 'description'], {
    keepHistory: 1000 * 60 * 5,
    localSearch: true,
  });

  // geographical sovereignty
  globalObj.geoJSON = geo;
  Session.set('filteredCountries', geo.country);

  // cryptographical sovereignty
  globalObj.tokenJSON = token;
  Session.set('filteredCoins', token.coin);
});

Template.main.onRendered(() => {
  if (document.getElementsByClassName('inhibitor').length > 0) {
    document.getElementsByClassName('inhibitor')[0].addEventListener('touchmove', (e) => { e.preventDefault(); });
  }

  if (!Meteor.Device.isPhone() && $(window).width() < gui.MOBILE_MAX_WIDTH) {
    $('.navbar').css('left', 0);
    Session.set('miniWindow', true);
    if (Meteor.user()) { Session.set('sidebar', true); }
    toggleSidebar();
  } else if (!Meteor.Device.isPhone()) {
    Session.set('sidebar', false);
    toggleSidebar();
  }
});

Template.main.helpers({
  popupList() {
    return Session.get('popupList');
  },
  showNotice() {
    return Session.get('showNotice');
  },
  landingStyle() {
    if (!Meteor.user()) {
      return 'right-hero';
    }
    return '';
  },
  loggedWithPhone() {
    return (Meteor.Device.isPhone() && Meteor.user());
  },
});

Template.main.events({
  'click .inhibitor'() {
    toggleSidebar();
  },
});
