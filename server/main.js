import { onPageLoad } from 'meteor/server-render';
import { Meteor } from 'meteor/meteor';
import { meta, urlDoctor } from '/imports/startup/both/routes';
import { log } from '/lib/const';

import '/imports/startup/server';
import '/imports/startup/both';

Meteor.startup(() => {
  // Mail server settings
  process.env.MAIL_URL = Meteor.settings.private.smtpServer;
});

onPageLoad(function (sink) {
  let url = sink.request.url.path;
  if (url.charAt(0) === '/') {
    url = url.substring(1);
  }
  const path = url.split('/');

  let tags;

  switch (path[0]) {
    case 'vote':
    case 'peer':
    case 'geo':
    default:
      tags = {
        title: `${Meteor.settings.public.Collective.name} - ${Meteor.settings.public.Collective.profile.bio}`,
        description: Meteor.settings.public.Collective.profile.bio,
        image: `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${Meteor.settings.public.Collective.profile.logo}`,
      };
      if (Meteor.settings.private.API.facebook.appId) {
        tags.facebookId = Meteor.settings.private.API.facebook.appId;
      }
      if (Meteor.settings.public.Collective.profile.twitter) {
        tags.twitter = Meteor.settings.public.Collective.profile.twitter;
      }
      break;
  }

  const head = meta(tags);
  sink.appendToHead(head);

  let hostname;
  if (Meteor.isServer) {
    Meteor.onConnection(function (result) {
      hostname = result.httpHeaders;
    });
  }

  log(`{ server: 'onPageLoad', path: '${url}', httpHeader: '${JSON.stringify(hostname)}' }`);
});
