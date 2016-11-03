Meteor.methods({
  sendVerificationLink() {
    let userId = Meteor.userId();
    console.log('[sendVerificationLink] sending email to ' + userId);
    if ( userId ) {
      return Accounts.sendVerificationEmail( userId );
    }
  }
});
