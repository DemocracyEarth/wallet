Template.verifyEmail.rendered = function () {
  Accounts.verifyEmail( Session.get('emailToken'), ( error ) =>{
    if ( error ) {
      Session.set('verificationResult', error.reason)
    } else {
      Session.set('verificationResult', TAPi18n.__('email-verified'))
    }
  });
}

Template.verifyEmail.helpers({
  verificationResult: function () {
    return Session.get('verificationResult');
  }
})
