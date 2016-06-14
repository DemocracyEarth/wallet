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
  'click #signature': function () {
    Modules.client.displayModal(
      true,
    {
      icon            : 'images/author-signature.png',
      title           : 'proposal-author',
      message         : 'proposal-signed-identity',
      cancel          : 'not-now',
      action          : 'sign-proposal',
      isAuthorization : true,
    },
      function() {
        Modules.both.signContract(Session.get('contractId'), Meteor.user(), 'AUTHOR');
      }
    );
  }
})
