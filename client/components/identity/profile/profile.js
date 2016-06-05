Template.profile.helpers({
  configProfile: function () {
    return !Meteor.user().profile.configured;
  },
  tags: function () {
    if (Meteor.user().profile.votes.total > 0) {

    } else {

    }
  },
  userId: function () {
    return Meteor.user()._id;
  },
  notVerified: function () {

  },
  hasDelegations: function () {
    //TODO implement delegation reader to display them.
    return false;
  }
});

Template.warning.events({
  "click .resend-verification-link": function ( event, template ) {
    console.log('sending email');
    Meteor.call( 'sendVerificationLink', ( error, response ) => {
      if ( error ) {
        console.log( error.reason, 'danger' );
      } else {
        let email = Meteor.user().emails[ 0 ].address;
        console.log( `Verification sent to ${ email }!`, 'success' );
      }
    });
  }
})
