import { Meteor } from 'meteor/meteor';
import '/imports/startup/server';
import '/imports/startup/both';

Meteor.startup(() => {
  // Mail server settings
  process.env.MAIL_URL = Meteor.settings.private.smtpServer;
});
