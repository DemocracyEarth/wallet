import RavenLogger from 'meteor/flowkey:raven';
import { Meteor } from 'meteor/meteor';

const ravenOptions = {};

export const ravenLogger = new RavenLogger({
  publicDSN: Meteor.settings.public.sentryPublicDSN,
  shouldCatchConsoleError: true, // default true
  trackUser: true, // default false
}, ravenOptions);
