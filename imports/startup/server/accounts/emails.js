import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Accounts.emailTemplates.siteName = Meteor.settings.public.Collective.name;
const name = Meteor.settings.public.Collective.name;
const address = Meteor.settings.public.Collective.emails[0].address;
Accounts.emailTemplates.from = `${name} <${address}>`;

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return "[" + Meteor.settings.public.Collective.name + "] " + TAPi18n.__('verify-email-address') +  " Verify Your Email Address";
  },
  text( user, url ) {
    let emailAddress   = user.emails[0].address,
        urlWithoutHash = url.replace( '#/', '' ),
        supportEmail   = Meteor.settings.public.Collective.emails[0].address,
        //TODO use an HTML template and make language agnostic.
        emailBody      = `To verify your email address (${emailAddress}) visit the following link:\n\n${urlWithoutHash}\n\n
                          If you did not request this verification, please ignore this email.
                          If you feel something is wrong, please contact our support team: ${supportEmail}.`;

    return emailBody;
  }
};
