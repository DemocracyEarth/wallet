import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { displayModal } from '/imports/ui/modules/modal';

/**
* @summary reject vote message;
*/
const _notMember = () => {
  // not member of dao
  displayModal(
    true,
    {
      icon: Meteor.settings.public.app.logo,
      title: TAPi18n.__('moloch-not-member'),
      message: TAPi18n.__('moloch-alert-not-member'),
      cancel: TAPi18n.__('close'),
      alertMode: true,
    },
  );
};

/**
* @summary not synced chain message;
*/
const _notSynced = () => {
  // not synced
  displayModal(
    true,
    {
      icon: Meteor.settings.public.app.logo,
      title: TAPi18n.__('not-synced'),
      message: TAPi18n.__('not-synced-message'),
      cancel: TAPi18n.__('close'),
      alertMode: true,
    },
  );
};

const _notLogged = () => {
  // not logged
  displayModal(
    true,
    {
      icon: Meteor.settings.public.app.logo,
      title: TAPi18n.__('place-vote'),
      message: TAPi18n.__('unlogged-cant-vote'),
      cancel: TAPi18n.__('close'),
      alertMode: true,
    },
  );
};

/**
* @summary poll no longer open;
*/
const _pollClosed = () => {
  // poll already closed
  displayModal(
    true,
    {
      icon: Meteor.settings.public.app.logo,
      title: TAPi18n.__('poll-closed'),
      message: TAPi18n.__('poll-is-closed'),
      cancel: TAPi18n.__('close'),
      alertMode: true,
    },
  );
};

/**
* @summary already voted here
*/
const _alreadyVoted = () => {
  // poll already closed
  displayModal(
    true,
    {
      icon: Meteor.settings.public.app.logo,
      title: TAPi18n.__('already-voted'),
      message: TAPi18n.__('already-voted-detail'),
      cancel: TAPi18n.__('close'),
      alertMode: true,
    },
  );
};

/**
* @summary couldn't find web3 wallet
*/
const _noWallet = () => {
  // no wallet
  displayModal(
    true,
    {
      icon: Meteor.settings.public.app.logo,
      title: TAPi18n.__('no-wallet'),
      message: TAPi18n.__('no-wallet-message'),
      cancel: TAPi18n.__('close'),
      alertMode: true,
    },
  );
};

/**
* @summary prompt a message of an error with the wallet
* @param {object} error with code and message
*/
const _walletError = (err) => {
  let message;
  switch (err.code) {
    case -32602:
      message = TAPi18n.__('metamask-invalid-argument');
      break;
    case -32603:
      message = TAPi18n.__('metamask-invalid-address');
      break;
    case 4001:
      message = TAPi18n.__('metamask-denied-signature');
      break;
    default:
      if (err.message.slice(0, 66) === 'WalletMiddleware - Invalid "from" address.\n{\n  "originalError": {}') {
        message = TAPi18n.__('metamask-invalid-address');
      } else {
        message = err.message;
      }
  }
  displayModal(
    true,
    {
      icon: Meteor.settings.public.app.logo,
      title: TAPi18n.__('wallet'),
      message,
      cancel: TAPi18n.__('close'),
      alertMode: true,
    }
  );
};

export const walletError = _walletError;
export const noWallet = _noWallet;
export const alreadyVoted = _alreadyVoted;
export const pollClosed = _pollClosed;
export const notLogged = _notLogged;
export const notSynced = _notSynced;
export const notMember = _notMember;
