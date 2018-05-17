import RavenLogger from 'meteor/flowkey:raven';
import { Meteor } from 'meteor/meteor';

const ravenOptions = {};
console.log('------------ SDJKFDKJHFKSJD ')
const ravenLogger = new RavenLogger({
  privateDSN: Meteor.settings.private.sentryPrivateDSN,
  shouldCatchConsoleError: true, // default true
  trackUser: true, // default false
}, ravenOptions);

console.log(ravenLogger);

export default ravenLogger;
