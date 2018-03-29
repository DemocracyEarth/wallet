import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { gui } from '/lib/const';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { sidebarWidth, sidebarPercentage, getDelegatesMenu } from '/imports/ui/modules/menu';
import { showFullName } from '/imports/startup/both/modules/utils';
import { getFlag } from '/imports/ui/templates/components/identity/avatar/avatar';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Transactions } from '/imports/api/transactions/Transactions';
import { processedTx, updateWalletCache } from '/imports/api/transactions/transaction';

import '/imports/ui/templates/layout/sidebar/sidebar.html';
import '/imports/ui/templates/components/collective/collective.js';
import '/imports/ui/templates/widgets/inbox/inbox.js';

/**
* @summary draws the sidebar if activated
*/
function drawSidebar() {
  if (Session.get('sidebar') === true && $('#menu').css('margin-left') === `-${sidebarPercentage()}%`) {
    Session.set('sidebar', false);
  }
}

function labelName(user) {
  let name = `${showFullName(user.profile.firstName, user.profile.lastName, user.username)} ${getFlag(user.profile, true)}`;
  if (user._id === Meteor.userId()) {
    name += ` <span class='sidebar-tag'>${TAPi18n.__('you')}</span>`;
  }
  return name;
}

/**
* @summary translates db object to a menu ux object
* @param {object} user database user object
*/
function dataToMenu(user) {
  if (user) {
    return {
      id: user._id,
      label: labelName(user),
      icon: user.profile.picture,
      iconActivated: false,
      feed: 'user',
      value: true,
      separator: false,
      url: `/peer/${user.username}`,
      selected: false,
    };
  }
  return undefined;
}

/**
* @summary for a given db result returns list with menu options
* @param {object} db data to parse for menu options
* @param {boolean} sort if do alphabetical sort or not
*/
function getList(db, sort) {
  const members = [];
  for (const i in db) {
    members.push(dataToMenu(db[i]));
  }
  if (sort) {
    return _.sortBy(members, (user) => { return user.label; });
  }
  return members;
}

/**
* @summary gets list of delegats for current user
* @param {object} contractFeed
* @param {object} transactionFeed
*/
function getDelegates(contractFeed, transactionFeed) {
  const delegates = _.sortBy(getDelegatesMenu(contractFeed, transactionFeed), (user) => { return parseInt(0 - (user.sent + user.received), 10); });
  let delegateList = [];
  // let totalVotes = 0;
  for (const i in delegates) {
    delegateList.push(Meteor.users.find({ _id: delegates[i].userId }).fetch()[0]);
  }

  // remove duplicates
  let finalList = delegateList;
  for (let i = 0; i < delegateList.length; i += 1) {
    for (let k = 0; k < finalList.length; k += 1) {
      if (i !== k) {
        if (delegateList[i]._id === delegateList[k]._id) {
          finalList[k] = 'EMPTY';
        }
      }
    }
  }
  finalList = _.without(finalList, 'EMPTY');
  delegateList = finalList;

  return getList(delegateList, false);
}

/**
* @summary all members of the collective without the delegates
* @param {object} currentDelegates list of delegates
*/
const _otherMembers = (currentDelegates) => {
  const members = getList(Meteor.users.find().fetch(), true);
  const delegates = currentDelegates;
  const finalList = [];
  let isDelegate;
  if (delegates !== undefined && delegates.length > 0) {
    for (const id in members) {
      isDelegate = false;
      for (const del in delegates) {
        if (delegates[del] !== undefined) {
          if (members[id].id === delegates[del].id) {
            isDelegate = true;
            break;
          }
        }
      }
      if (!isDelegate) {
        finalList.push(members[id]);
      }
    }
  }
  return finalList;
};

Template.sidebar.onCreated(function () {
  Template.instance().delegates = new ReactiveVar();
  Template.instance().members = new ReactiveVar(0);

  const instance = this;

  instance.autorun(function () {
    const subscriptionContracts = instance.subscribe('feed', { view: 'delegationContracts' });
    if (subscriptionContracts.ready()) {
      if (Meteor.user()) {
        const contracts = Contracts.find({ $and: [{ signatures: { $elemMatch: { _id: Meteor.userId() } } }, { kind: 'DELEGATION' }] }).fetch();
        const subscriptionTransactions = instance.subscribe('delegations', {
          view: 'delegationTransactions',
          items: _.pluck(contracts, '_id'),
        });
        if (subscriptionTransactions.ready()) {
          const transactions = Transactions.find({ $or: [{ $and: [{ 'output.entityId': Meteor.userId() }, { kind: 'DELEGATION' }] },
                                                         { $and: [{ 'input.entityId': Meteor.userId() }, { kind: 'DELEGATION' }] },
                                                         { $and: [{ 'input.delegateId': Meteor.userId() }, { kind: 'DELEGATION' }] },
                                                         { $and: [{ 'output.delegateId': Meteor.userId() }, { kind: 'DELEGATION' }] }] }).fetch();

          const txList = _.pluck(transactions, '_id');
          let newTransaction;
          if (Session.get('delegationTransactions')) {
            const txNew = _.difference(txList, Session.get('delegationTransactions'));
            if (txNew.length > 0) {
              for (const i in txNew) {
                newTransaction = Transactions.findOne({ _id: txNew[i] });
                if (newTransaction.input.entityId !== Meteor.userId()
                    && !processedTx(newTransaction._id)
                    && !Session.get(`vote-${Meteor.userId()}-${newTransaction.output.entityId}`)) {
                  updateWalletCache(newTransaction, true);
                }
              }
            }
          }
          Session.set('delegationTransactions', txList);

          if (Meteor.user()) {
            Template.instance().delegates.set(getDelegates(
              contracts,
              transactions,
            ));
          }
        }
      }
    }
  });
});

Template.sidebar.onRendered(() => {
  $('.left').width(`${sidebarPercentage()}%`);
  if (!Meteor.Device.isPhone()) {
    $('.navbar').css('left', `${sidebarPercentage()}%`);
  }

  drawSidebar();

  $(window).resize(() => {
    $('.left').width(`${sidebarPercentage()}%`);
    if (!Meteor.Device.isPhone()) {
      $('.navbar').css('left', `${sidebarPercentage()}%`);
    }
    if (!Session.get('sidebar')) {
      $('#menu').css('margin-left', `${parseInt(0 - sidebarWidth(), 10)}px`);
    } else {
      let newRight = 0;
      if ($(window).width() < gui.MOBILE_MAX_WIDTH) {
        newRight = parseInt(0 - sidebarWidth(), 10);
      }
      $('#content').css('left', sidebarWidth());
      $('#content').css('right', newRight);
    }
  });
});

Template.sidebar.helpers({
  delegate() {
    return Template.instance().delegates.get();
  },
  member() {
    // Template.instance().members.set(_otherMembers(Template.instance().delegates.get()));
    return Template.instance().members.get();
  },
  totalMembers() {
    if (Template.instance().members.get()) {
      return Template.instance().members.get().length;
    }
    return 0;
  },
  totalDelegates() {
    if (Template.instance().delegates.get()) {
      return Template.instance().delegates.get().length;
    }
    return 0;
  },
});
