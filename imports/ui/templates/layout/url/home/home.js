import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';

import { Contracts } from '/imports/api/contracts/Contracts';
import { introEditor } from '/imports/ui/templates/widgets/compose/compose';
import { shortenCryptoName } from '/imports/ui/templates/components/identity/avatar/avatar';
import { getCoin } from '/imports/api/blockchain/modules/web3Util.js';

import '/imports/ui/templates/layout/url/home/home.html';
import '/imports/ui/templates/layout/url/landing/landing.js';
import '/imports/ui/templates/layout/url/hero/hero.js';
import '/imports/ui/templates/widgets/feed/feed.js';
import '/imports/ui/templates/widgets/tally/tally.js';
import '/imports/ui/templates/widgets/feed/paginator.js';
import '/imports/ui/templates/widgets/compose/compose.js';
import '/imports/ui/templates/components/decision/ledger/ledger.js';

/**
* @summary specific rendering for unlogged users
* @return {string} landing css style
*/
const _landingMode = (style) => {
  let css = '';

  if (!Meteor.user()) {
    switch (style) {
      case 'post':
        css = `split-${style}-landing`;
        break;
      case 'left':
        css = 'split-landing split-anon';
        break;
      case 'right':
      default:
        css = 'split-landing';
        break;
    }
  } else if (!Meteor.Device.isPhone()) {
    css = 'split-landing';
  }

  if (!Meteor.settings.public.app.config.interface.showTransactions) {
    css += ' width-100';
  }

  return css;
};

Template.home.onCreated(function () {
  this.modeVar = new ReactiveVar();
  const instance = this;

  this.autorun(() => {
    Template.instance().modeVar.set(Router.current().url);
    const avatarList = Session.get('avatarList');
    if (avatarList) {
      const query = [];
      for (const i in avatarList) {
        query.push({ _id: avatarList[i] });
      }
      this.subscription = instance.subscribe('singleUser', { $or: query });
    }
  });
});

Template.home.onRendered(() => {
  Session.set('editorMode', false);
});

Template.home.helpers({
  editorMode() {
    return Session.get('showPostEditor');
  },
  newContractId() {
    if (Session.get('draftContract')) {
      return Session.get('draftContract')._id;
    }
    return undefined;
  },
  modeArray() {
    return [Template.instance().modeVar.get()];
  },
  content() {
    return {
      template: 'feed',
      dataObject: this,
    };
  },
  newLogin() {
    return Session.get('newLogin');
  },
});

Template.screen.helpers({
  tag() {
    return (this.options.view === 'tag');
  },
  peer() {
    return (this.options.view === 'peer');
  },
  home() {
    return (this.options.view === 'latest');
  },
  period() {
    return (this.options.view === 'period');
  },
  post() {
    return (this.options.view === 'post');
  },
  geo() {
    return (this.options.view === 'geo');
  },
  token() {
    return (this.options.view === 'token');
  },
});

Template.homeFeed.onCreated(function () {
  Template.instance().feedReady = new ReactiveVar(false);
  const instance = this;
  const subscription = instance.subscribe('feed', { view: instance.data.options.view, sort: { createdAt: -1 }, userId: instance.data.options.userId, username: instance.data.options.username, period: instance.data.options.period });

  Session.set('minimizedEditor', true);

  if (!Session.get('draftContract') && !Meteor.Device.isPhone()) {
    introEditor({ desktopMode: true, replyMode: false, replyId: '' });
  }

  instance.autorun(function (computation) {
    if (subscription.ready()) {
      instance.feedReady.set(true);
      computation.stop();
    }
  });
});


/**
* @summary display title either for feed or ledger
* @param {object} options the query for the feed
* @param {boolean} ledgerMode write for ledger
*/
const _getTitle = (options, ledgerMode) => {
  let asset;
  let username = options.username;
  const geo = Session.get('geo');

  switch (options.view) {
    case 'token':
      asset = getCoin(options.token);
      if (ledgerMode) {
        return TAPi18n.__('ledger-token-posts').replace('{{asset}}', asset.name);
      }
      return TAPi18n.__('feed-token-posts').replace('{{asset}}', asset.name);
    case 'geo':
      asset = _.where(geo.country, { code: options.country.toUpperCase() })[0];
      if (ledgerMode) {
        return TAPi18n.__('ledger-geo-posts').replace('{{asset}}', asset.name);
      }
      return TAPi18n.__('feed-geo-posts').replace('{{asset}}', asset.name);
    case 'peer':
      if (!options.username) {
        username = Meteor.users.findOne(options.userId).username;
      }
      if (ledgerMode) {
        return TAPi18n.__('ledger-peer-posts').replace('{{asset}}', shortenCryptoName(username).toUpperCase());
      }
      return TAPi18n.__('feed-peer-posts').replace('{{asset}}', shortenCryptoName(username).toUpperCase());
    default:
      if (ledgerMode) {
        return TAPi18n.__('recent-activity');
      }
      return TAPi18n.__('happening-now');
  }
};

Template.homeFeed.helpers({
  unloggedMobile() {
    return (Meteor.Device.isPhone() && !Meteor.user());
  },
  editorMode() {
    return Session.get('showPostEditor');
  },
  minimizedMode() {
    return Session.get('minimizedEditor');
  },
  replyMode() {
    return (Session.get('draftContract') && Session.get('draftContract').replyId);
  },
  newContractId() {
    if (Session.get('draftContract')) {
      return Session.get('draftContract')._id;
    }
    return undefined;
  },
  mainFeed() {
    const tally = this;
    Session.set('longFeedView', this.options.view);
    return tally;
  },
  mainLedger() {
    const tally = this;
    tally.options.sort = { timestamp: -1 };

    return {
      ledgerTitle: _getTitle(this.options, true),
      options: tally.options,
      singlePost: true,
      hidePost: false,
      peerFeed: false,
      postFeed: false,
      homeFeed: true,
    };
  },
  contextView() {
    return (this.options.view !== 'latest');
  },
  feedReady() {
    return Template.instance().feedReady.get();
  },
  feedTitle() {
    return _getTitle(this.options);
  },
  landingMode(feed) {
    return _landingMode(feed);
  },
  displayLanding() {
    return (Meteor.settings.public.app.config.displayLanding && !Meteor.user());
  },
  showTransactions() {
    return Meteor.settings.public.app.config.interface.showTransactions;
  },
  dictator() {
    if (Meteor.settings.public.app.config.governance.dictatorship) {
      return !(Meteor.user() && (
        (Meteor.settings.public.app.config.governance.dictator.userId === Meteor.userId())
        || Meteor.user().profile.wallet.reserves[0].publicAddress === Meteor.settings.public.app.config.governance.dictator.publicAddress));
    }
    return false;
  },
  adminBallotCreatorOnly() {
    if (Meteor.settings.public.app.config.interface.adminBallotCreatorOnly.active) {
      // If adminBallotCreatorOnly is active then only the user with a verified email specified in settings can create new ballots
      if (Meteor.user().emails && Meteor.user().emails[0].verified && Meteor.user().emails[0].address === Meteor.settings.public.app.config.interface.adminBallotCreatorOnly.email) {
        return false;
      }
      return true;
    }
    return false;
  },
});

Template.postFeed.onCreated(function () {
  Template.instance().postReady = new ReactiveVar(false);

  const instance = this;
  const subscription = instance.subscribe('singleContract', { view: 'thread', sort: { createdAt: -1 }, keyword: Template.currentData().options.keyword });

  instance.autorun(function (computation) {
    if (subscription.ready()) {
      instance.postReady.set(true);
      computation.stop();
    }
  });
});


Template.periodFeed.onCreated(function () {
  Template.instance().periodReady = new ReactiveVar(false);

  const instance = this;
  const subscription = instance.subscribe('feed', { view: instance.data.options.view, sort: { createdAt: -1 }, userId: instance.data.options.userId, username: instance.data.options.username, period: instance.data.options.period });
  // const subscription = instance.subscribe('singleContract', { view: 'thread', sort: { createdAt: -1 }, keyword: Template.currentData().options.keyword });

  instance.autorun(function (computation) {
    if (subscription.ready()) {
      instance.periodReady.set(true);
      computation.stop();
    }
  });
});


Template.postFeed.helpers({
  votes() {
    const tally = this;
    tally.options.view = 'threadVotes';
    tally.options.sort = { timestamp: -1 };
    tally.ballotEnabled = this.ballotEnabled;
    tally.postReady = this.postReady;
    tally.peerFeed = false;
    tally.postFeed = true;
    // options=this.options ballotEnabled=ballotEnabled postReady=postReady peerFeed=false postFeed=true
    // winning options
    const contract = Contracts.findOne({ keyword: Template.currentData().options.keyword });
    let maxVotes = 0;
    let winningBallot;
    if (contract && contract.tally) {
      for (const i in contract.tally.choice) {
        if (contract.tally.choice[i].votes > maxVotes) {
          maxVotes = contract.tally.choice[i].votes;
          winningBallot = contract.tally.choice[i].ballot;
        }
      }
      tally.winningBallot = winningBallot;
      tally.contractId = tally._id;
    }

    return tally;
  },
  postReady() {
    return Template.instance().postReady.get();
  },
  thread() {
    const replies = this;
    replies.options.view = 'thread';
    replies.singlePost = true;
    replies.displayActions = true;
    return replies;
  },
  ballotEnabled() {
    const contract = Contracts.findOne({ keyword: Template.currentData().options.keyword });
    if (contract) {
      return contract.ballotEnabled;
    }
    return undefined;
  },
  newContractId() {
    if (Session.get('draftContract')) {
      return Session.get('draftContract')._id;
    }
    return undefined;
  },
  editorMode() {
    return Session.get('showPostEditor');
  },
  replyId() {
    const contract = Contracts.findOne({ keyword: this.options.keyword });
    if (contract) {
      return contract._id;
    }
    return undefined;
  },
  landingMode() {
    return _landingMode('post');
  },
  showTransactions() {
    return Meteor.settings.public.app.config.interface.showTransactions;
  },
});

Template.periodFeed.helpers({
  votes() {
    console.log(`votes(): ${JSON.stringify(this)}`);
    const tally = this;
    tally.options.view = 'periodVotes';
    tally.options.sort = { timestamp: -1 };
    tally.ballotEnabled = this.ballotEnabled;
    tally.postReady = this.periodReady;
    tally.periodFeed = true;
    tally.peerFeed = false;
    tally.postFeed = false;
    // options=this.options ballotEnabled=ballotEnabled postReady=postReady peerFeed=false postFeed=true
    // winning options
    /* console.log(`Template.currentData().options.keyword: ${Template.currentData().options.keyword}`);
    const contract = Contracts.findOne({ keyword: Template.currentData().options.keyword });
    let maxVotes = 0;
    let winningBallot;
    if (contract && contract.tally) {
      for (const i in contract.tally.choice) {
        if (contract.tally.choice[i].votes > maxVotes) {
          maxVotes = contract.tally.choice[i].votes;
          winningBallot = contract.tally.choice[i].ballot;
        }
      }
      tally.winningBallot = winningBallot;
      tally.contractId = tally._id;
    }*/
    console.log('tally:');
    console.log(tally);
    console.log(tally.options);
    return tally;
  },
  periodReady() {
    return Template.instance().periodReady.get();
  },
  thread() {
    const replies = this;
    replies.options.view = 'period';
    replies.singlePost = false;
    replies.displayActions = true;
    return replies;
  },
  ballotEnabled() {
    const contract = Contracts.findOne({ keyword: Template.currentData().options.keyword });
    if (contract) {
      return contract.ballotEnabled;
    }
    return undefined;
  },
  newContractId() {
    if (Session.get('draftContract')) {
      return Session.get('draftContract')._id;
    }
    return undefined;
  },
  editorMode() {
    return Session.get('showPostEditor');
  },
  replyId() {
    const contract = Contracts.findOne({ keyword: this.options.keyword });
    if (contract) {
      return contract._id;
    }
    return undefined;
  },
  landingMode(feed) {
    return _landingMode(feed);
  },
  showTransactions() {
    return Meteor.settings.public.app.config.interface.showTransactions;
  },
  feedTitle() {
    return TAPi18n.__('moloch-period-feed').replace('{{period}}', TAPi18n.__(`moloch-${this.options.period}`));
  },
});
