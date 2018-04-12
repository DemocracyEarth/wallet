import RavenLogger from 'meteor/flowkey:raven';
import { Meteor } from 'meteor/meteor';

const ravenOptions = {};

const enabled = Meteor.settings.public.sentryPublicDSN && Meteor.settings.public.sentryPublicDSN.length > 0;

export const ravenLogger = enabled ? new RavenLogger({
  publicDSN: Meteor.settings.public.sentryPublicDSN,
  shouldCatchConsoleError: true, // default true
  trackUser: true, // default false
}, ravenOptions) : { log: (error) => { console.log(error); } };
