import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';

import { getAnonymous } from '/imports/startup/both/modules/User';
import { signContract } from '/imports/startup/both/modules/Contract';
import { displayModal } from '/imports/ui/modules/modal';

import './signatures.html';
import '../../identity/avatar/avatar.js';

Template.signatures.rendered = function rendered() {
  if (!Session.get('contract')) { return; }
  const contractAuthors = Session.get('contract').signatures;
  if (contractAuthors !== undefined) {
    for (let i = 0; i < contractAuthors.length; i++) {
      if (Meteor.user() != null) {
        if (contractAuthors[i]._id === Meteor.user()._id) {
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
  userSigned() {
    return Session.get('userSigned');
  },
  signer() {
    if (Session.get('contract')) {
      const signerIds = [];
      if (Session.get('contract').signatures !== undefined) {
        for (let i in Session.get('contract').signatures) {
          signerIds.push(Session.get('contract').signatures[i]._id);
        }
        return signerIds;
      }
      // is anonymous
      if (!this.editorMode) {
        return [getAnonymous(true)];
      }
    }
    return undefined;
  },
  timestamp() {
    if (Session.get('contract')) {
      let d = Date();
      if (Session.get('contract').timestamp !== undefined) {
        d = Session.get('contract').timestamp;
        return d.format('{Month} {d}, {yyyy}');
      }
    }
    return '';
  },
});

Template.signatures.events({
  'click #sign-author'() {
    displayModal(
      true,
      {
        icon: 'images/author-signature.png',
        title: TAPi18n.__('proposal-author'),
        message: TAPi18n.__('proposal-signed-identity'),
        cancel: TAPi18n.__('not-now'),
        action: TAPi18n.__('sign-proposal'),
        displayProfile: true,
        profileId: Meteor.user()._id,
      },
      function () {
        Session.set('userSigned', true);
        signContract(Session.get('contract')._id, Meteor.user(), 'AUTHOR');
      }
    );
  },
});
