import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';

import { getProfileFromUsername, getAnonymous } from '/imports/startup/both/modules/User';
import { removeContract } from '/imports/startup/both/modules/Contract';
import { getProfileName, stripHTMLfromText } from '/imports/ui/modules/utils';
import { timeCompressed } from '/imports/ui/modules/chronos';
import { displayModal } from '/imports/ui/modules/modal';
import { animationSettings } from '/imports/ui/modules/animation';
import { addChoiceToBallot, getTotalVoters } from '/imports/ui/modules/ballot';
import { displayNotice } from '/imports/ui/modules/notice';
import { Contracts } from '/imports/api/contracts/Contracts';

import './feedItem.html';
import '../../components/decision/stage/stage.js';
import '../../components/decision/tag/tag.js';
import '../../components/identity/avatar/avatar.js';
import '../../widgets/transaction/transaction.js';

Template.feedItem.onCreated(() => {
  // Embedded mode means that Items are in an embedded feed to be selected (ie: for a ballot)
  if (this.firstNode && this.firstNode.parentNode.id === 'proposalSuggestions') {
    Template.instance().embeddedMode = new ReactiveVar(true);
  } else {
    Template.instance().embeddedMode = new ReactiveVar(false);
  }
});

Template.feedItem.helpers({
  description() {
    let text = String();
    const profile = [];
    if (this.kind === 'DELEGATION') {
      for (const user in this.signatures) {
        profile.push(getProfileFromUsername(this.signatures[user].username));
      }
      text = this.description;
      if (profile.length === 2) {
        text = text.replace('<delegator>', getProfileName(profile[0]));
        text = text.replace('<delegate>', getProfileName(profile[1]));
      }
      return stripHTMLfromText(text).replace(/(([^\s]+\s\s*){35})(.*)/, '$1…');
    }
    return stripHTMLfromText(this.description).replace(/(([^\s]+\s\s*){35})(.*)/, '$1…');
  },
  url() {
    if (this.stage === 'DRAFT') {
      return `/vote/draft?id=${this._id}`;
    }
    return this.url;
  },
  tags() {
    return this.tags;
  },
  sinceDate(timestamp) {
    return `${timeCompressed(timestamp)}`;
  },
  editorMode(stage) {
    if (stage === 'DRAFT') { return true; } return false;
  },
  voterMode(stage) {
    if (stage === 'LIVE') { return true; } return false;
  },
  embeddedMode() {
    return Template.instance().embeddedMode.get();
  },
  signatures() {
    if (this.signatures) {
      return this.signatures;
    }
    return [getAnonymous()];
  },
  userIsAuthor(signatures) {
    if (Meteor.user() != null) {
      if (Meteor.user()._id === this.owner) {
        return true;
      }
      for (const stamp in signatures) {
        if (signatures[stamp]._id === Meteor.user()._id) {
          return true;
        }
      }
    }
    return false;
  },
  delegationMode() {
    return (this.kind === 'DELEGATION');
  },
  feedContract() {
    return Contracts.findOne({ _id: this._id });
  },
  voters() {
    const total = getTotalVoters(this);
    if (total === 1) {
      return `${total} ${TAPi18n.__('voter').toLowerCase()}`;
    } else if (total === 0) {
      return TAPi18n.__('no-voters');
    }
    return `${total} ${TAPi18n.__('voters').toLowerCase()}`;
  },
});

Template.feedItem.events({
  'click .micro-button-remove'(event) {
    const proposalTitle = event.target.parentNode.getAttribute('title');
    const proposalId = event.target.parentNode.getAttribute('id');
    const dom = `#feedItem-${proposalId}`;
    displayModal(
      true,
      {
        icon: 'images/remove-item.png',
        title: TAPi18n.__('remove-title'),
        message: `${TAPi18n.__('remove-draft-warning')} <br><em>${proposalTitle}</em>`,
        cancel: TAPi18n.__('not-now'),
        action: TAPi18n.__('remove-draft'),
        displayProfile: false,
      },
      () => {
        $(dom)
          .velocity({ opacity: 0, marginTop: '0px', marginBottom: '0px', height: 0 }, {
            duration: animationSettings.duration,
            complete() {
              removeContract(proposalId);
              displayNotice(TAPi18n.__('remove-draft-success'), true);
            },
          });
      }
    );
  },
  'click .micro-button-addballot'(event) {
    addChoiceToBallot(Session.get('contract')._id, event.target.parentNode.getAttribute('id'));
  },
});
