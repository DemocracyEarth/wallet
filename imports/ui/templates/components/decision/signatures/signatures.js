Template.signatures.rendered = function () {
  if (!Session.get('contract')) { return };
  var contractAuthors = Session.get('contract').signatures;
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
    if (Session.get('contract')) {
      var signerIds = new Array();
      if (Session.get('contract').signatures != undefined) {
        for (i in Session.get('contract').signatures) {
          signerIds.push(Session.get('contract').signatures[i]._id);
        }
        return signerIds;
      } else {
        //is anonymous
        if (!this.editorMode) {
          return [Modules.both.getAnonymous(true)];
        }
      }
    }
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
        displayProfile  : true,
        profileId       : Meteor.user()._id
      },
      function() {
        Session.set('userSigned', true);
        Modules.both.signContract(Session.get('contract')._id, Meteor.user(), 'AUTHOR');
      }
    );
  }
})
