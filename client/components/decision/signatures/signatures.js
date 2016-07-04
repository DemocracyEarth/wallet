Template.signatures.rendered = function () {
  var contractAuthors = Contracts.findOne({ _id: Session.get('contractId') }).signatures;

  if (contractAuthors != undefined) {
    for (var i = 0; i < contractAuthors.length; i++ ) {
      if (Meteor.user() != null) {
        if (contractAuthors[i]._id == Meteor.user()._id) {
          Session.set('userSigned', true);
          break;
        } else {
          Session.set('userSigned', false);
        }
      }
    }
  }

  Session.set('displaySignaturePopup', false);

};

Template.signatures.helpers({
  userSigned: function () {
    return Session.get('userSigned');
  },
  signer: function () {
    return Contracts.findOne({_id: Session.get('contractId')}).signatures;
  }
});

Template.signatures.events({
  'click #sign-author': function () {
    Modules.client.displayModal(
      true,
      {
        icon            : 'images/author-signature.png',
        title           : TAPi18n.__('proposal-author'),
        message         : TAPi18n.__('proposal-signed-identity'),
        cancel          : TAPi18n.__('not-now'),
        action          : TAPi18n.__('sign-proposal'),
        isAuthorization : true,
      },
      function() {
        Session.set('userSigned', true);
        Modules.both.signContract(Session.get('contractId'), Meteor.user(), 'AUTHOR');
      }
    );
  }
})
