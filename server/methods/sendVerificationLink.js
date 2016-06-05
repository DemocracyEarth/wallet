Meteor.methods({
  sendVerificationLink() {
    let userId = Meteor.userId();
    console.log('sening email to ' + userId);
    if ( userId ) {
      return Accounts.sendVerificationEmail( userId );
    }
  }
});
