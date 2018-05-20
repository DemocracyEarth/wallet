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

  let head;

  switch (path[0]) {
    case 'vote':
    case 'peer':
    case 'geo':
    default:
      head = meta({
        title: `${Meteor.settings.public.Collective.name} - ${Meteor.settings.public.Collective.profile.bio}`,
        description: Meteor.settings.public.Collective.profile.bio,
        image: `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${Meteor.settings.public.Collective.profile.logo}`,
        twitter: Meteor.settings.public.Collective.profile.twitter,
      });
      sink.appendToHead(head);
      break;
  }

  log(`{ server: 'onPageLoad', path: ${url} }`);
});
