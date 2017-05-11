import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';

import { showResults, updateExecutionStatus } from '/imports/ui/modules/ballot';
import { Vote } from '/imports/ui/modules/Vote';
import { verifyDelegationRight, verifyVotingRight, getProfileFromUsername } from '../both/modules/User';
import { showFullName } from '../both/modules/utils';
import { Contracts, schemaContract } from '../../api/contracts/Contracts';
import { Tags } from '../../api/tags/Tags';
import { Collectives } from '../../api/collectives/Collectives';
import { toggleSidebar, setSidebarMenu } from '../../ui/modules/menu';

/**
* private methods for effective routing
**/

/**
* @summary matches url param with db schema string accordingly
* @param {string} key - url querying object
*/
const _matchType = (key) => {
  const schema = schemaContract._firstLevelSchemaKeys;
  for (const feat in schema) {
    if (schema[feat].toLowerCase() === key.toLowerCase()) {
      return schema[feat];
    }
  }
  return false;
};


/**
* @summary from the paramaters obtained in a URL builds a query for the db
* @param {object} params - url querying object
* @return {object} query - returns a query with object ready for mongo
****/
const _buildQuery = (params) => {
  const query = {};
  query.collectiveId = Meteor.settings.public.Collective._id;
  for (let key in params) {
    // strict type with contracts schema
    const dbKey = _matchType(key);
    if (dbKey !== false) {
      if (key !== dbKey) {
        Object.defineProperty(params, dbKey,
            Object.getOwnPropertyDescriptor(params, key));
        delete params[key];
        key = dbKey;
      }
    }
    switch (key) {
      case 'id':
        query._id = params[key];
        break;
      case 'keyword':
        query[key] = params[key];
        break;
      case 'tag':
        query.tags = {
          $elemMatch: {
            url: `/tag/${params[key]}`,
          },
        };
        break;
      case 'username':
      case 'peer':
        query.signatures = {
          $elemMatch: {
            username: params[key],
          },
        };
        break;
      case 'hash':
      case 'query':
        break;
      case 'stage':
        if (params[key].toUpperCase() === 'DRAFT') {
          if (Meteor.user() !== undefined) {
            query.owner = Meteor.user()._id;
          }
        }
      default:
        query[key] = params[key].toUpperCase();
    }
  }

  // TODO: rejected must be discarded so 'no vote' proposals also get listed
  return query;
};

/**
* @summary generates section title based on url query
* @param {object} params - url querying object
* @return {string} title - returns title to fetch on json dictionary
*/
const _buildTitle = (params) => {
  let title = String();
  if (typeof params === 'string') {
    if (params === 'draft') {
      title = `navbar-${params}`;
    } else {
      const contractTitle = Contracts.findOne({ keyword: params }).title;
      if (Meteor.Device.isPhone()) {
        return TAPi18n.__('proposal');
      }
      return `${TAPi18n.__('proposal')} <strong><em>${contractTitle}</em></strong>`;
    }
  } else {
    for (const key in params) {
      if (title.length !== 0) { title += '-'; }
      switch (key) {
        case 'tag':
          return `<strong><em>${Tags.findOne({ keyword: params[key] }).text}</em></strong>${TAPi18n.__('proposals')}`;
        case 'username': {
          // TODO builds string strictly from cache search, no request to server is ever done. Eventually might be needed.
          const profile = getProfileFromUsername(params[key]);
          if (profile) {
            const fullname = showFullName(profile.firstName, profile.lastName);
            return `<strong><em>${fullname}</em></strong>${TAPi18n.__('proposals')}`;
          }
          return `${TAPi18n.__('peer')} ${TAPi18n.__('proposals')}`;
        }
        case 'hash':
        case 'query':
          break;
        default:
          if (key !== 'peer') {
            title += `${key}-${params[key]}`;
          } else {
            title += key;
          }
      }
    }
  }
  return TAPi18n.__(title.toLowerCase());
};


/**
* loads a feed based on url query
* @param {object} query - query settings
****/
const _loadFeed = (feed) => {
  switch (feed) {
    case 'live-votes':
      Session.set('voterMode', true);
      Session.set('editorMode', false);
      if (typeof Session.get('sidebarMenuSelectedId') !== 'string') {
        Session.set('sidebarMenuSelectedId', 0);
      }
      break;
    case 'live-votes-peer':
      if (typeof Session.get('sidebarMenuSelectedId') !== 'string') {
        Session.set('sidebarMenuSelectedId', 1);
      }
      break;
    case 'votes-finish-approved':
      if (typeof Session.get('sidebarMenuSelectedId') !== 'string') {
        Session.set('sidebarMenuSelectedId', 2);
      }
      break;
    case 'vote-drafts':
      Session.set('voterMode', false);
      Session.set('editorMode', true);
      if (typeof Session.get('sidebarMenuSelectedId') !== 'string') {
        Session.set('sidebarMenuSelectedId', 3);
      }
      break;
    case 'votes-finish-rejected':
      Session.set('voterMode', false);
      Session.set('editorMode', true);
      if (typeof Session.get('sidebarMenuSelectedId') !== 'string') {
        Session.set('sidebarMenuSelectedId', 4);
      }
      break;
    case 'live-votes-custom':
      Session.set('voterMode', true);
      Session.set('editorMode', false);
      Session.set('emptyContent', {
        label: TAPi18n.__(`empty-feed-label-${feed}`),
        detail: TAPi18n.__(`empty-feed-detail-${feed}`),
        contribute: TAPi18n.__(`empty-feed-contribute-${feed}`),
        url: `/vote/draft?kind=${feed}`,
      });
      break;
  }
};


/**
* @summary sets which wallet to use for reference in contract based on if the user signed or not
* @param {object} contract - contract to analyze
* NOTE: this might be totally deprecated by now.. need to test it.
*/
const _setContractWallet = (contract) => {
  let userContract = false;
  let role = String();
  if (contract.kind === 'DELEGATION') {
    if (Meteor.user() != null) {
      for (const i in contract.signatures) {
        if (contract.signatures[i]._id === Meteor.user()._id) {
          userContract = true;
          role = contract.signatures[i].role;
          break;
        }
      }
    } else {
      userContract = false;
    }
    if (userContract === true) {
      if (role === 'DELEGATE') {
        Session.set('newVote', contract.wallet);
      } else {
        Session.set('newVote', new Vote(Meteor.user().profile.wallet));
      }
    } else {
      Session.set('newVote', contract.wallet);
    }
  }
};


/**
* loads contract based on view as in url params
* @param {object} view - view to be used inferred from params
* @return {string} id - contract id to load
****/
const _loadContract = (view, id) => {
  // load contract
  let contract;
  if (id !== undefined) {
    contract = Contracts.findOne({ _id: id });
  } else {
    contract = Contracts.findOne({ keyword: view });
  }

  if (contract !== undefined) {
    // settings
    Session.set('contract', contract);
    Session.set('voteKeyword', view);
    Session.set('stage', contract.stage);
    contractId = contract._id;

    // close poll if finish
    if (contract.stage === 'LIVE') {
      Meteor.call('getServerTime', function (error, result) {
        Session.set('time', result);
        if (Session.get('contract').closingDate < new Date(Session.get('time'))) {
          const election = showResults(Session.get('contract'));
          updateExecutionStatus(Session.get('contract'), election);
        }
      });
    }

    // status of action button
    if (contract.kind === 'DELEGATION') {
      Session.set('rightToVote', verifyDelegationRight(contract.signatures));
    } else if (contract.kind === 'VOTE' && contract.stage === 'DRAFT') {
      Session.set('rightToVote', true);
      Session.set('alreadyVoted', false);
    } else if (contract.kind === 'VOTE' && contract.stage === 'LIVE') {
      Session.set('rightToVote', true);
      Session.set('alreadyVoted', verifyVotingRight(contract._id));
    } else if (contract.kind === 'VOTE' && contract.stage === 'FINISH') {
      Session.set('rightToVote', false);
    }

    // wallet
    _setContractWallet(contract);

    // mode
    switch (contract.stage) {
      case 'DRAFT':
        Session.set('editorMode', true);
        Session.set('voterMode', false);
        break;
      case 'LIVE':
      default:
        Session.set('editorMode', false);
        Session.set('voterMode', true);
        break;
    }
  }
};


/**
* @summary returns from a menu array the selected feed
* @param {object} menu - menu array
*/
const _getMenuFeed = (menu) => {
  if (Session.get('sidebarMenuSelectedId') && typeof Session.get('sidebarMenuSelectedId') !== 'string') {
    const item = Session.get('sidebarMenuSelectedId');
    return menu[item].feed;
  }
  for (const item in menu) {
    if (menu[item].selected === true) {
      return menu[item].feed;
    }
  }
  return false;
};

/**
* @summary based on the query returns proper feed to fetch
* @param {object} query - query settings
* @return {string} feed - feed name constant (false if not found)
* @TODO: this whole switch can easily be done programatically, i don't have time now.
*/
const _getQueryFeed = (query) => {
  if (query === undefined) { return false; }
  switch(query.stage.toUpperCase()) {
    case 'DRAFT':
      switch(query.kind.toUpperCase()) {
        case 'VOTE':
          if (query.peer) {
            return 'CUSTOM PEER DRAFTS';
          } else {
            return 'vote-drafts';
          }
        case 'DELEGATION':
          if (query.peer) {
            return 'CUSTOM PEER DELEGATION DRAFTS';
          } else {
            return 'DELEGATION DRAFTS';
          }
        case 'MEMBERSHIP':
          if (query.peer) {
            return 'CUSTOM PEER MEMBERSHIP DRAFT';
          } else {
            return 'MEMBERSHIP DRAFTS';
          }
      }
      return 'ALL DRAFTS';
    case 'LIVE':
      switch(query.kind.toUpperCase()) {
        case 'VOTE':
          if (query.peer) {
            return 'live-votes-peer';
          }
          return 'live-votes';
        case 'DELEGATION':
          if (query.peer) {
            return 'CUSTOM PEER DELEGATION SENT';
          }
          return 'LIVE DELEGATIONS';
        case 'MEMBERSHIP':
          if (query.peer) {
            return 'CUSTOM PEER MEMBERSHIP REQUEST';
          }
          return 'LIVE MEMBERSHIPS';
      }
      return 'ALL LIVE';
    case 'FINISH':
      switch (query.kind.toUpperCase()) {
        case 'VOTE':
          switch (query.executionStatus.toUpperCase()) {
            case 'APPROVED':
              if (query.peer) {
                return 'CUSTOM PEER APPROVED VOTES';
              }
              return 'votes-finish-approved';
            case 'REJECTED':
              if (query.peer) {
                return 'CUSTOM PEER REJECTED VOTES';
              }
              return 'votes-finish-rejected';
            case 'ALTERNATIVE':
              if (query.peer) {
                return 'CUSTOM PEER ALTERNATIVE VOTES';
              }
              return 'VOTES FINISH ALTERNATIVE';
          }
          return 'ALL VOTES FINISH';
        case 'DELEGATION':
          switch (query.executionStatus.toUpperCase()) {
            case 'APPROVED':
              if (query.peer) {
                return 'CUSTOM PEER APPROVED DELEGATIONS';
              }
              return 'CONFIRMED DELEGATIONS';
            case 'REJECTED':
            default:
              if (query.peer) {
                return 'CUSTOM PEER REJECTED DELEGATIONS';
              }
              return 'REJECTED DELEGATIONS';
          }
          return 'ALL DELEGATIONS';
        case 'MEMBERSHIP':
          switch (query.executionStatus.toUpperCase()) {
            case 'APPROVED':
              if (query.peer) {
                return 'CUSTOM PEER APPROVED MEMBERSHIPS';
              }
              return 'APPROVED MEMBERSHIPS';
            case 'REJECTED':
            default:
              if (query.peer) {
                return 'CUSTOM PEER REJECTED MEMBERSHIPS';
              }
              return 'REJECTED MEMBERSHIPS';
          }
        default:
          return 'ALL CONFIRMED MEMBERSHIPS';
      }
    default:
      return 'ALL FINISH';
  }
};

/**
* @summary returns the selected feed from menu if unknown in mem
*/
const _getMenuSelection = (params) => {
  const menu = Session.get('menuDecisions');
  const delegates = Session.get('menuDelegates');
  let feed = _getMenuFeed(menu);
  if (!feed) {
    feed = _getMenuFeed(delegates);
    if (!feed) {
      switch (params) {
        case 'draft':
          feed = 'vote-drafts';
          break;
        default:
          feed = 'live-votes';
      }
    }
  }
  return feed;
};

/**
* @summary set session variables for specific view based on query
* @param {object} query - url query
*/
const _setSessionVars = (params) => {
  let feed;

  // collective
  if (Session.get('collective') === undefined) {
    Session.set('collectiveId', Meteor.settings.public.Collective._id);
    Session.set('collective', Collectives.findOne({ _id: Session.get('collectiveId') }));
  }

  // view
  if (!params) {
    feed = 'live-votes-custom';
    _loadFeed(feed);
  } else if (params.contract) {
    feed = _getMenuSelection(params.contract);
    _loadContract(params.contract, params.query.id);
  } else {
    feed = _getQueryFeed(params.query);
    _loadFeed(feed);
  }

  setSidebarMenu(feed);
};

/**
* @summary loads external scripts if they're not loaded yet
*/
const _getExternalScripts = () => {
  if (typeof window.Spinner === 'undefined') {
    $.getScript('/js/spinner.js');
  }
  if (typeof window.datepicker === 'undefined') {
    $.getScript('/datepicker.js');
  }
  $.getScript('/jquery.resize.js');
  $.getScript('/js/jquery.ui.touch-punch.min.js');
};

const _getNavbarAction = (path) => {
  if (Meteor.Device.isPhone()) {
    switch (path) {
      case '/vote':
        return 'BACK';
      default:
        return 'SIDEBAR';
    }
  }
  return 'SIDEBAR';
};

/**
* @summary main settings for navbar behaviour
* @param {string} title - title for it
*/
const _configNavbar = (label, path) => {
  if (Session.get('sidebar') === undefined) {
    Session.set('sidebar', true);
    toggleSidebar();
  }
  Session.set('navbar', {
    title: label,
    toggle: Session.get('sidebar'),
    href: '#',
    action: _getNavbarAction(path),
  });
};

/**
* @summary checks if user never had funds
***/
const _userHasEmptyWallet = () => {
  if (Meteor.user().profile.wallet.balance === 0 && Meteor.user().profile.wallet.available == 0 && Meteor.user().profile.wallet.placed === 0) {
    if (Meteor.user().profile.wallet.address.length === 0) {
      if (Meteor.user().profile.credentials !== undefined) {
        if (Meteor.user().profile.credentials[0].source === 'facebook') {
          // TODO this should be less hardcoded than it looks like
          return true;
        }
      }
    }
  }
  return false;
};

/**
* @summary clears all sessions vars need to reset view
*/
const _clearSessionVars = () => {
  Session.set('contract', undefined);
  Session.set('newVote', undefined); // used for wallet (refactor name)
  Session.set('candidateBallot', undefined); // used for ballot
  Session.set('disabledCheckboxes', false);

  // ensure user gets funds
  if (Meteor.user() != null) {
    if (_userHasEmptyWallet()) {
      Meteor.call('genesisTransaction', Meteor.user()._id, (error) => {
        if (error) {
          console.log(`[genesisTransaction] ERROR: ${error}`);
        }
      });
    }
  }
};

export const fn = {
  clearSessionVars: _clearSessionVars,
  configNavbar: _configNavbar,
  buildTitle: _buildTitle,
  buildQuery: _buildQuery,
  getExternalScripts: _getExternalScripts,
  setSessionVars: _setSessionVars,
};
