import { onPageLoad } from 'meteor/server-render';
import { Meteor } from 'meteor/meteor';
import { meta, urlDoctor, getAllUsernames, toTitleCase } from '/imports/startup/both/routes';
import { TAPi18n } from 'meteor/tap:i18n';

import { Contracts } from '/imports/api/contracts/Contracts';
import { log } from '/lib/const';

import '/imports/startup/server';
import '/imports/startup/both';

Meteor.startup(() => {
  // Mail server settings
  process.env.MAIL_URL = Meteor.settings.private.smtpServer;
});

const _fixDBUrl = (url) => {
  if (url.first() === '/') {
    return url.substring(1);
  }
  return url;
};

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

  switch (path[0]) {
    case 'vote':
      contract = Contracts.findOne({ keyword: path[1] });
      if (contract) {
        if (contract.ballotEnabled) {
          tags.title = `${getAllUsernames(contract)}${TAPi18n.__('vote-tag-ballot-title')} ${Meteor.settings.public.Collective.name}`;
        } else {
          tags.title = `${getAllUsernames(contract)}${TAPi18n.__('vote-tag-title')} ${Meteor.settings.public.Collective.name}`;
        }
        tags.description = contract.title;
        tags.image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${_fixDBUrl(Meteor.settings.public.Collective.profile.logo)}`;
      } else {
        tags.title = `${Meteor.settings.public.Collective.name} - ${Meteor.settings.public.Collective.profile.bio}`;
        tags.description = Meteor.settings.public.Collective.profile.bio;
        tags.image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${_fixDBUrl(Meteor.settings.public.Collective.profile.logo)}`;
      }
      break;
    case 'peer':
      user = Meteor.users.findOne({ username: path[1] });
      tags.title = `@${path[1]}${TAPi18n.__('profile-tag-title')} ${Meteor.settings.public.Collective.name}`;
      tags.description = `@${path[1]}${TAPi18n.__('profile-tag-description')} ${Meteor.settings.public.Collective.name}`;
      if (user) {
        tags.image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${_fixDBUrl(user.profile.picture)}`;
      } else {
        tags.image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${_fixDBUrl(Meteor.settings.public.Collective.profile.logo)}`;
      }
      break;
    case 'tag':
      tags.title = `#${path[1]}${TAPi18n.__('hashtag-tag-title')} ${Meteor.settings.public.Collective.name}`;
      tags.description = `#${path[1]}${TAPi18n.__('hashtag-tag-description')} ${Meteor.settings.public.Collective.name}.`;
      tags.image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${_fixDBUrl(Meteor.settings.public.Collective.profile.logo)}`;
      break;
    case 'geo':
      country = toTitleCase(path[1]);
      tags.title = `${country} ${TAPi18n.__('country-tag-title')} ${Meteor.settings.public.Collective.name}`;
      tags.description = `${country}${TAPi18n.__('country-tag-description')} ${Meteor.settings.public.Collective.name}.`;
      tags.image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${_fixDBUrl(Meteor.settings.public.Collective.profile.logo)}`;
      break;
    default:
      tags = {
        title: `${Meteor.settings.public.Collective.name} - ${Meteor.settings.public.Collective.profile.bio}`,
        description: Meteor.settings.public.Collective.profile.bio,
        image: `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${_fixDBUrl(Meteor.settings.public.Collective.profile.logo)}`,
      };
      break;
  }
  if (Meteor.settings.private.API.facebook.appId) {
    tags.facebookId = Meteor.settings.private.API.facebook.appId;
  }
  if (Meteor.settings.public.Collective.profile.twitter) {
    tags.twitter = Meteor.settings.public.Collective.profile.twitter;
  }

  const head = meta(tags);
  sink.appendToHead(head);

  let hostname;
  if (Meteor.isServer) {
    Meteor.onConnection(function (result) {
      hostname = result;
    });
  }

  log(`{ server: 'onPageLoad', path: '${url}', httpHeader: '${JSON.stringify(hostname)}' }`);
});
