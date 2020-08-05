import { $ } from 'meteor/jquery';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';

import { Contracts } from '/imports/api/contracts/Contracts';
import { Collectives } from '/imports/api/collectives/Collectives';
import { introEditor } from '/imports/ui/templates/widgets/compose/compose';
import { getUser } from '/imports/ui/templates/components/identity/avatar/avatar';
import { shortenCryptoName } from '/imports/startup/both/modules/metamask';
import { getCoin } from '/imports/api/blockchain/modules/web3Util.js';
import { Tokens } from '/imports/api/tokens/tokens';

import '/imports/ui/templates/components/identity/replica/replica.js';
import '/imports/ui/templates/layout/url/home/home.html';
import '/imports/ui/templates/components/collective/guild/guild.js';
import '/imports/ui/templates/layout/url/landing/landing.js';
import '/imports/ui/templates/layout/url/synchronizer/synchronizer.js';
import '/imports/ui/templates/layout/url/hero/hero.js';
import '/imports/ui/templates/widgets/feed/feed.js';
import '/imports/ui/templates/widgets/tally/tally.js';
import '/imports/ui/templates/widgets/feed/paginator.js';
import '/imports/ui/templates/widgets/tabs/tabs.js';
import '/imports/ui/templates/layout/load/load.js';

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

/**
* @summary subscribes to user data
* @param {object} user user to parse
* @param {object} instance template running this
* @param {function} callback when ready take this action
* @returns {string} country
*/
const _getDao = (daoId) => {
  const daoList = Session.get('daoList');
  if (daoId && daoList) {
    if (!_.contains(daoList, daoId)) {
      daoList.push(daoId);
      Session.set('daoList', daoList);
    }
  } else if (daoId) {
    Session.set('daoList', [daoList]);
  }
};


/**
* @summary creates a replica object based on available data or requests it
* @param {object} instance with data to persist the replica
*/
const _generateReplica = (instance) => {
  const replicaUser = Meteor.users.findOne({ username: instance.data.options.username });
  if (replicaUser) {
    instance.replica.set({
      user: replicaUser,
    });
    instance.replicaReady.set(true);
  } else if (instance.data.options.username) {
    Meteor.call('getReplica', instance.data.options.username, (err, res) => {
      if (err) {
        console.log(err);
      }
      if (res && res.user) {
        getUser(res.user._id);
      }
      instance.replica.set(res);
      instance.replicaReady.set(true);
    });
  } else {
    instance.replicaReady.set(true);
  }
};

Template.home.onCreated(function () {
  this.modeVar = new ReactiveVar();
  const instance = this;

  const tokenFeed = instance.subscribe('tokens', { view: 'wholeList' });

  instance.autorun(() => {
    Template.instance().modeVar.set(Router.current().url);

    const avatarList = Session.get('avatarList');
    if (avatarList) {
      const query = [];
      for (const i in avatarList) {
        query.push({ _id: avatarList[i] });
      }
      this.subscription = instance.subscribe('singleUser', { $or: query });
    }

    const daoList = Session.get('daoList');
    if (daoList) {
      const daoQuery = [];
      for (const i in daoList) {
        daoQuery.push({ _id: daoList[i] });
      }
      this.subscription = instance.subscribe('singleDao', { $or: daoQuery });
    }

    if (tokenFeed.ready()) {
      const tokenList = {};
      tokenList.coin = Tokens.find().fetch();
      Session.set('token', tokenList);
    }
  });
});

const _getLandingMode = () => {
  return (!Meteor.user() && Meteor.settings.public.app.config.displayLanding && Session.get('displayFoundation'));
};

Template.home.onRendered(() => {
  Session.set('editorMode', false);
});

Template.home.helpers({
  editorMode() {
    return Session.get('showPostEditor');
  },
  landingMode() {
    return _getLandingMode();
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

/**
* @summary performs an action when selecting a tab
* @param {string} panel instruction
*/
const _tabSelect = (panel) => {
  switch (panel) {
    case 'alternative':
      $('#main-feed').css('display', 'none');
      $('#alternative-feed').css('display', 'inline-block');
      break;
    case 'main':
    default:
      $('#main-feed').css('display', 'inline-block');
      $('#alternative-feed').css('display', 'none');
  }
  $('.right').scrollTop(0);
};

/**
* @summary creates a tab menu based on the current view
* @param {string} view name
*/
const _setTabMenu = (view) => {
  const menu = [];
  menu.push({
    label: TAPi18n.__('moloch-proposal'),
    selected: true,
    action: () => {
      _tabSelect('main');
    },
  });
  switch (view) {
    case 'peer':
      menu.push(
        {
          id: 'profile',
          label: TAPi18n.__('profile'),
          selected: false,
          action: () => {
            _tabSelect('alternative');
          },
        },
      );
      break;
    case 'period':
      menu.push(
        {
          id: 'votes',
          label: TAPi18n.__('votes'),
          selected: false,
          action: () => {
            _tabSelect('alternative');
          },
        },
      );
      break;
    default:
      menu.push(
        {
          id: 'budget',
          label: TAPi18n.__('budget'),
          selected: false,
          action: () => {
            _tabSelect('alternative');
          },
        },
      );
  }
  return menu;
};

Template.homeFeed.onCreated(function () {
  Template.instance().feedReady = new ReactiveVar(false);
  Template.instance().replicaReady = new ReactiveVar(false);
  Template.instance().replica = new ReactiveVar();
  const instance = this;
  const subscription = instance.subscribe('feed', { view: instance.data.options.view, sort: { timestamp: -1 }, userId: instance.data.options.userId, username: instance.data.options.username, period: instance.data.options.period });

  Session.set('minimizedEditor', true);

  if (!Session.get('draftContract') && !Meteor.Device.isPhone()) {
    introEditor({ desktopMode: true, replyMode: false, replyId: '' });
  }

  instance.autorun(function (computation) {
    if (subscription.ready()) {
      _generateReplica(instance);
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
    case 'dao':
      if (ledgerMode) {
        return TAPi18n.__('dao-events');
      }
      return TAPi18n.__('dao-proposals');
    default:
      if (ledgerMode) {
        return TAPi18n.__('recent-activity');
      }
      return TAPi18n.__('happening-now');
  }
};

Template.homeFeed.helpers({
  isPerson() {
    const replica = Template.instance().replica.get();
    return (replica && replica.user);
  },
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
  isDAO() {
    return (this.options.view === 'dao');
  },
  collective() {
    const collective = Collectives.findOne({ name: this.options.name });
    const collectiveId = collective._id;
    return {
      collectiveId,
    };
  },
  replicaReady() {
    return Template.instance().replicaReady.get();
  },
  address() {
    return {
      replica: Template.instance().replica.get(),
    };
  },
  menu() {
    return { item: _setTabMenu(Template.instance().data.options.view) };
  },
});


export const getLandingMode = _getLandingMode;
export const getDao = _getDao;
