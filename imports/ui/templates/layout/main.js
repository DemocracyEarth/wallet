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
import { displayLogin } from '/imports/ui/modules/popup';

import { globalObj } from '/lib/global';
import './main.html';
import '../widgets/modal/modal';
import '../widgets/popup/popup';
import './sidebar/sidebar';
import './navigation/navigation';
import './response/verifyEmail/verifyEmail';

Meteor.startup(() => {
  // Mail server settings
  process.env.MAIL_URL = Meteor.settings.smtpServer;

  // setup language
  Session.set('showLoadingIndicator', true);

  // internationalization library
  TAPi18n.setLanguage(Meteor.settings.public.app.language)
    .done(function () {
      Session.set('showLoadingIndicator', false);
    })
    .fail(function (error_message) {
      console.log(error_message);
    });

  //scripts
  $.getScript('js/spinner.js', function () {});

  //time
  Meteor.call('getServerTime', function (error, result) {
      Session.set('time', result);
  });

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

  // geographical Info
  HTTP.get(Meteor.absoluteUrl('data/geo.json'), function (err, result) {
    globalObj.geoJSON = result.data;
    Session.set('filteredCountries', result.data.country);
  });
});

Template.main.events({
  'mouseup #content'(event) {
    if (Session.get('displayPopup')) {
      if (event.target.parentElement.id !== 'loggedUser') {
        if (event.target.id !== 'loggedUser') {
          if (event.target.id !== 'agora-login') {
            displayLogin(event);
          }
        }
      }
    }
  },
});
