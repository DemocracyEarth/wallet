import { Meteor } from 'meteor/meteor';

Meteor.methods({
  sendVerificationLink() {
    let userId = Meteor.userId();
    console.log('[sendVerificationLink] sending email to ' + userId);
    if ( userId ) {
      return Accounts.sendVerificationEmail( userId );
    }
  }
});

const sendVerificationLink = function(){
  console.log('[sendVerificationLink] to be done');
};
