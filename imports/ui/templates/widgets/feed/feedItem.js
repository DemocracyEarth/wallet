import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';

import { getProfileFromUsername, getAnonymous } from '/imports/startup/both/modules/User';
import { removeContract } from '/imports/startup/both/modules/Contract';
import { getProfileName, stripHTMLfromText } from '/imports/ui/modules/utils';
import { timeCompressed } from '/imports/ui/modules/chronos';
import { displayModal } from '/imports/ui/modules/modal';
import { animationSettings } from '/imports/ui/modules/animation';
import { addChoiceToBallot, getTotalVoters, getRightToVote, getBallot } from '/imports/ui/modules/ballot';
import { displayNotice } from '/imports/ui/modules/notice';
import { Contracts } from '/imports/api/contracts/Contracts';

import '/imports/ui/templates/widgets/feed/feedItem.html';
import '/imports/ui/templates/widgets/transaction/transaction.js';
import '/imports/ui/templates/widgets/spinner/spinner.js';
import '/imports/ui/templates/components/identity/avatar/avatar.js';

/**
* @summary determines whether this decision can display results or notice
* @return {boolean} yes or no
*/
const _displayResults = (contract) => {
  if (contract) {
    const dbContract = Contracts.findOne({ _id: contract._id });
    if (dbContract) {
      if (getTotalVoters(contract) > 0 || (dbContract.tally && dbContract.tally.voter.length > 0)) {
        return ((contract.stage === 'FINISH') || (contract.permanentElection && contract.stage !== 'DRAFT'));
      }
    }
  }
  return false;
};

const _getReplyContract = (replyId) => {
  if (replyId) {
    const dbReply = Contracts.findOne({ _id: replyId });
    if (dbReply) {
      return dbReply;
    }
  }
  return '';
};

/**
* @summary if im on current item context in url determines
* @param {object} item current item
*/
const _here = (item) => {
  return (window.location.pathname.substring(0, item.url.length) === `${item.url}`);
};


/*
const isScrolledIntoView = (elem) => {
  if (elem) {
    const docViewTop = $(window).scrollTop();
    const docViewBottom = docViewTop + $(window).height();

    const elemTop = $(elem).offset().top;
    const elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
  }
  return false;
};

/**
@summary if its on a mobile waits a second to refresh feed item with reactive one

const scrollRefresh = () => {
  if (Meteor.Device.isPhone()) {
    return 1000;
  }
  return 1;
};
*/

Template.feedItem.onCreated(function () {
  Template.instance().ready = new ReactiveVar(false);
  Template.instance().contract = new ReactiveVar(Contracts.findOne({ _id: this.data._id }));
  Template.instance().rightToVote = new ReactiveVar(false);
  Template.instance().candidateBallot = new ReactiveVar();
  Template.instance().displayResults = new ReactiveVar(false);
  // Template.instance().aboveFold = new ReactiveVar();
  Template.instance().replySource = new ReactiveVar(false);
});

const _threadItem = (instance) => {
  if (instance.data.mainFeed) {
    $(`#feedItem-${instance.data._id}`).wrapAll(`<div id='thread-${instance.data._id}' class='vote-thread vote-thread-context' />`);
    $(`#thread-${instance.data._id}`).prepend(`<div class='thread-sub'><div class='thread-needle thread-reply'>
    <a title='${instance.data.replyId ? `${TAPi18n.__('reply-to')}: ${stripHTMLfromText(_getReplyContract(instance.data.replyId).title).substring(0, 30)}...` : ''}'
    href='${instance.data.replyId ? _getReplyContract(instance.data.replyId).url : ''}'><img src='${Router.path('home')}images/reply.png'></a>
    </div></div>`);
  } else {
    $(`#feedItem-${instance.data._id}`).wrapAll(`<div id='thread-${instance.data._id}' class='vote-thread' />`);
    $(`#thread-${instance.data._id}`).prepend(`<div class='thread-sub'><div class='thread-needle ${instance.data.lastItem ? 'thread-last' : ''}'></div></div>`);
    if (instance.data.depth > 1) {
      for (let i = 1; i < instance.data.depth; i += 1) {
        $(`#thread-${instance.data._id}`).wrapAll(`<div id='thread-${instance.data._id}-depth-${i}' class='vote-thread' />`);
      }
    }
  }
  if (instance.data.url && _here(instance.data)) {
    $('.split-left').scrollTop($(`#thread-${instance.data._id}`).offset().top);
  }
};

Template.feedItem.onRendered(function () {
  // Template.instance().aboveFold.set(isScrolledIntoView(document.querySelector(`#feedItem-${Template.currentData()._id}`)));
  const instance = this;
  let isScrolling;

  if (Meteor.userId()) {
    instance.voteId = `vote-${Meteor.userId()}-${instance.data._id}`;
  }

  // threading
  if (instance.data.replyId) {
    _threadItem(instance);
  }

/*
  $('.right').scroll(function () {
    Meteor.clearTimeout(isScrolling);
    isScrolling = Meteor.setTimeout(function () {
      if (document.querySelector(`#ballot-${instance.data._id}`)) {
        instance.aboveFold.set(isScrolledIntoView(document.querySelector(`#voteBar-vote-${Meteor.userId()}-${instance.data._id}`)));
      }
    }, scrollRefresh());
  });
*/

  if (instance.data.replyId) {
    const dbReply = Contracts.findOne({ _id: instance.data.replyId });
    if (!dbReply) {
      const source = instance.subscribe('singleContract', { view: 'contract', sort: { createdAt: -1 }, contractId: instance.data.replyId });
      instance.autorun(function (computation) {
        if (source.ready()) {
          Template.instance().replySource.set(true);
          computation.stop();
        }
      });
    } else {
      Template.instance().replySource.set(true);
    }
  }

  if (!instance.data.tally && !instance.data.placeholder) {
    instance.autorun(function () {
      if (instance.data._id) {
        const subscription = instance.subscribe('transaction', { view: 'contractVotes', contractId: instance.data._id });
        const contract = instance.contract.get();
        if (subscription.ready() && !instance.ready.get()) {
          instance.rightToVote.set(getRightToVote(contract));
          instance.candidateBallot.set(getBallot(instance.data._id));
          instance.displayResults.set(_displayResults(contract));
          instance.ready.set(true);
        }
      }
    });
  } else {
    const contract = instance.data;
    instance.rightToVote.set(getRightToVote(instance.data));
    instance.candidateBallot.set(getBallot(instance.data._id));
    instance.displayResults.set(_displayResults(contract));
    instance.ready.set(true);
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
  focused() {
    if (_here(this)) {
      return 'title-thread';
    }
    return '';
  },
  contextHere() {
    return _here(this);
  },
  sinceDate(timestamp) {
    return `${timeCompressed(timestamp)}`;
  },
  blockchainAddress() {
    return `${this.blockchain.publicAddress.substring(0, 6)}...${this.blockchain.publicAddress.slice(-4)}`;
  },
  blockchainFullAddress() {
    return `${this.blockchain.publicAddress}`;
  },
  blockchainLink() {
    return `${Meteor.settings.public.web.sites.blockExplorer}${this.blockchain.publicAddress}`;
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
  tally() {
    return this.tally;
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
  displayActions() {
    return this.displayActions;
  },
  senderId() {
    return this.signatures[0]._id;
  },
  receiverId() {
    return this.signatures[1]._id;
  },
  feedContract() {
    return Template.instance().contract.get();
  },
  voters() {
    let total;
    const dbContract = Contracts.findOne({ _id: this._id });
    if (dbContract && dbContract.tally) {
      total = dbContract.tally.voter.length;
    } else {
      total = getTotalVoters(this);
    }
    if (total === 1) {
      return `${total} ${TAPi18n.__('voter').toLowerCase()}`;
    } else if (total === 0) {
      return TAPi18n.__('no-voters');
    }
    return `${total} ${TAPi18n.__('voters').toLowerCase()}`;
  },
  replyMode() {
    const draft = Session.get('draftContract');
    if (draft.replyId !== '') {
      return 'opacity: 0.5;';
    }
    return '';
  },
  electionData() {
    return Template.instance().ready.get();
  },
  replySource() {
    return Template.instance().replySource.get();
  },
  replyEditor() {
    return (Session.get('draftContract') && Session.get('draftContract').replyId === this._id);
  },
  spinnerStyle() {
    return `height: 0px;
            float: right;
            margin-top: 14px;
            margin-left: 10px;
            width: 20px;`;
  },
  rightToVote() {
    return Template.instance().rightToVote.get();
  },
  candidateBallot() {
    return Template.instance().candidateBallot.get();
  },
  displayResults() {
    const dbContract = Contracts.findOne({ _id: this._id });
    if (dbContract && dbContract.tally && dbContract.tally.voter.length > 0) {
      return true;
    }
    return Template.instance().displayResults.get();
  },
  replyData() {
    return {
      desktopMode: true,
      replyMode: true,
      replyId: this._id,
      depth: this.depth,
      mainFeed: this.mainFeed,
    };
  },
  /* onScreen() {
    return Template.instance().aboveFold.get();
  },*/
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
  'click #blockchain-explorer'(event) {
    event.preventDefault();
    window.open(event.currentTarget.href, '_blank');
  },
});

export const threadItem = _threadItem;
