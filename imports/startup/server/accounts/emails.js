import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { TAPi18n } from 'meteor/tap:i18n';

const collectiveName = (Meteor.settings.public.app && Meteor.settings.public.app.name) ? Meteor.settings.public.app.name : 'DAO';

Accounts.emailTemplates.siteName = collectiveName;

const name = collectiveName;
const address = (Meteor.settings.public.Collective && Meteor.settings.public.Collective.emails) ? Meteor.settings.public.Collective.emails[0].address : '';
Accounts.emailTemplates.from = `${name} <${address}>`;

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return `[${collectiveName}] ${TAPi18n.__('verify-email-address')} Verify Your Email Address`;
  },
  text(user, url) {
    const emailAddress = user.emails[0].address;
    const urlWithoutHash = url.replace('#/', '');
    const supportEmail = Meteor.settings.public.Collective.emails[0].address;
    const emailBody = `To verify your email address (${emailAddress}) visit the following link:\n\n${urlWithoutHash}\n\n
                          If you did not request this verification, please ignore this email.
                          If you feel something is wrong, please contact our support team ${supportEmail}.`;

    return emailBody;
  },
};
