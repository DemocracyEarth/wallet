Template.signatures.rendered = function () {
  var contractAuthors = Contracts.findOne({ _id: Session.get('contractId') }).authors;

  if (contractAuthors != undefined) {
    for (var i = 0; i < contractAuthors.length; i++ ) {
      if (Meteor.user() != null) {
        if (contractAuthors[i]._id == Meteor.user()._id) {
          Session.set('userSigned', true);
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
  toggle: function (picture) {
    if (Session.get('displaySignaturePopup')) {
      if (picture) {
        return '-white.png';
      } else {
        return 'profile-sign';
      }
    } else {
      if (picture) {
        return '.png';
      } else {
        return '';
      }
    }
  },
  displaySignaturePopup: function () {
    return Session.get('displaySignaturePopup');
  }
});

Template.signatures.events({
  'click #signature': function () {
    //Session.set('displaySignaturePopup', !Session.get('displaySignaturePopup'))
    Modules.client.displayModal(true, {
      icon    : 'images/author-signature.png',
      title   : 'proposal-author',
      message : 'proposal-signed-identity',
      cancel  : 'not-now',
      action  : 'sign-proposal'
    });
  }
})
