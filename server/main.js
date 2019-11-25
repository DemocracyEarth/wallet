import { onPageLoad } from 'meteor/server-render';
import { Meteor } from 'meteor/meteor';
import { meta } from '/imports/startup/both/routes';
import { TAPi18n } from 'meteor/tap:i18n';

import { Contracts } from '/imports/api/contracts/Contracts';
import { fixDBUrl, stripHTML, parseURL, urlDoctor, toTitleCase } from '/lib/utils';

import '/imports/startup/server';
import '/imports/startup/both';

Meteor.startup(() => {
  // Mail server settings
  process.env.MAIL_URL = Meteor.settings.private.smtpServer;
});

/**
* @summary server side rendering of html
* @param {function} sink class with http request info
*/
onPageLoad(function (sink) {
  let url = sink.request.url.path;
  if (url.charAt(0) === '/') {
    url = url.substring(1);
  }
  const path = url.split('/');

  let tags = { title: '', description: '', image: '' };
  let user;
  let contract;
  let country;
  let username;

  let mainPath = path[0];
  if (mainPath.substring(0, 1) === '$') {
    mainPath = 'token';
  } else if (mainPath.substring(0, 1) === '@') {
    mainPath = 'peer';
  } else if (mainPath.substring(2, 8) === 'period') {
    mainPath = 'period';
  } else if (mainPath.length === 2) {
    mainPath = 'geo';
  }

  switch (mainPath) {
    case 'vote':
      contract = Contracts.findOne({ keyword: path[1] });
      if (contract) {
        if (contract.ballotEnabled) {
          tags.description = `${TAPi18n.__('vote-tag-ballot-title').replace('{{collective}}', Meteor.settings.public.app.name)}`;
        } else {
          tags.description = `${TAPi18n.__('vote-tag-title').replace('{{collective}}', Meteor.settings.public.app.name)}`;
        }
        tags.title = stripHTML(contract.title);
        tags.image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${fixDBUrl(Meteor.settings.public.app.logo)}`;
      } else {
        tags.title = `${Meteor.settings.public.app.name} - ${Meteor.settings.public.app.bio}`;
        tags.description = Meteor.settings.public.app.bio;
        tags.image = parseURL(Meteor.settings.public.app.logo);
      }
      break;
    case 'peer':
      user = Meteor.users.findOne({ username: path[0].substring(1) });
      if (user) {
        username = `${path[0]}`;
        if (user.profile.firstName) {
          username = `${user.profile.firstName}`;
          if (user.profile.lastName) {
            username += ` ${user.profile.lastName}`;
          }
        }
      }
      tags.title = `${TAPi18n.__('profile-tag-title').replace('{{user}}', `${username}`).replace('{{collective}}', Meteor.settings.public.app.name)}`;
      tags.description = `${TAPi18n.__('profile-tag-description').replace('{{user}}', `${path[0]}`).replace('{{collective}}', Meteor.settings.public.app.name)}`;
      if (user) {
        tags.image = parseURL(user.profile.picture);
      } else {
        tags.image = parseURL(Meteor.settings.public.app.logo);
      }
      break;
    case 'tag':
    case 'period':
      tags.title = `${TAPi18n.__('hashtag-tag-title').replace('{{hashtag}}', path[0]).replace('{{collective}}', Meteor.settings.public.app.name)}`;
      tags.description = `${TAPi18n.__('hashtag-tag-description').replace('{{hashtag}}', path[0]).replace('{{collective}}', Meteor.settings.public.app.name)}`;
      tags.image = parseURL(Meteor.settings.public.app.logo);
      break;
    case 'token':
      tags.title = `${TAPi18n.__('hashtag-tag-title').replace('{{hashtag}}', path[0]).replace('{{collective}}', Meteor.settings.public.app.name)}`;
      tags.description = `${TAPi18n.__('hashtag-tag-description').replace('{{hashtag}}', path[0]).replace('{{collective}}', Meteor.settings.public.app.name)}`;
      tags.image = parseURL(Meteor.settings.public.app.logo);
      break;
    case 'geo':
      country = ''; // toTitleCase(path[0]);
      tags.title = `${TAPi18n.__('country-tag-title').replace('{{country}}', country).replace('{{collective}}', Meteor.settings.public.app.name)}`;
      tags.description = `${TAPi18n.__('country-tag-description').replace('{{country}}', country).replace('{{collective}}', Meteor.settings.public.app.name)}`;
      tags.image = parseURL(Meteor.settings.public.app.logo);
      break;
    default:
      tags = {
        title: `${Meteor.settings.public.app.name} - ${Meteor.settings.public.app.bio}`,
        description: Meteor.settings.public.app.bio,
        image: parseURL(Meteor.settings.public.app.logo),
      };
      break;
  }
  if (Meteor.settings.private.API.facebook.appId) {
    tags.facebookId = Meteor.settings.private.API.facebook.appId;
  }
  if (Meteor.settings.public.app.twitter) {
    tags.twitter = Meteor.settings.public.app.twitter;
  }

  const head = meta(tags, true);
  sink.appendToHead(head);
});
