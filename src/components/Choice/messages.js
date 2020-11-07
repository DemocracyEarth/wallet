import { displayModal } from 'components/Modal/Modal';
import i18n from 'i18n';

import logo from 'images/logo.png';


const modalContent = {
  default: {
    icon: logo,
    title: i18n.t('wallet'),
    cancel: i18n.t('close'),
    alertMode: true,
  },
  notMember: {
    icon: logo,
    title: i18n.t('moloch-not-member'),
    message: i18n.t('moloch-alert-not-member'),
    cancel: i18n.t('close'),
    alertMode: true,
  },
  notSynced: {
    icon: logo,
    title: i18n.t('not-synced'),
    message: i18n.t('not-synced-message'),
    cancel: i18n.t('close'),
    mode: 'ALERT',
  },
  notLogged: {
    icon: logo,
    title: i18n.t('place-vote'),
    message: i18n.t('unlogged-cant-vote'),
    cancel: i18n.t('close'),
    alertMode: true,
  },
  pollClosed: {
    icon: logo,
    title: i18n.t('poll-closed'),
    message: i18n.t('poll-is-closed'),
    cancel: i18n.t('close'),
    alertMode: true,
  },
  alreadyVoted: {
    icon: logo,
    title: i18n.t('already-voted'),
    message: i18n.t('already-voted-detail'),
    cancel: i18n.t('close'),
    alertMode: true,
  },
  noWallet: {
    icon: logo,
    title: i18n.t('no-wallet'),
    message: i18n.t('no-wallet-message'),
    cancel: i18n.t('close'),
    alertMode: true,
  }
};

/**
* @summary reject vote message;
*/
const _notMember = () => {
  // not member of dao
  displayModal(
    true,
    {
      icon: logo,
      title: i18n.t('moloch-not-member'),
      message: i18n.t('moloch-alert-not-member'),
      cancel: i18n.t('close'),
      alertMode: true,
    },
  );
};

/**
* @summary not synced chain message;
*/
const _notSynced = () => {
  // not synced
  window.modal = modalContent.notSynced;
  window.showModal.value = true;
  console.log(`window.showModal.value = true;`);
  console.log(window.showModal);

};

const _notLogged = () => {
  // not logged
  displayModal(
    true,
    {
      icon: logo,
      title: i18n.t('place-vote'),
      message: i18n.t('unlogged-cant-vote'),
      cancel: i18n.t('close'),
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
      icon: logo,
      title: i18n.t('poll-closed'),
      message: i18n.t('poll-is-closed'),
      cancel: i18n.t('close'),
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
      icon: logo,
      title: i18n.t('already-voted'),
      message: i18n.t('already-voted-detail'),
      cancel: i18n.t('close'),
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
      icon: logo,
      title: i18n.t('no-wallet'),
      message: i18n.t('no-wallet-message'),
      cancel: i18n.t('close'),
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
      message = i18n.t('metamask-invalid-argument');
      break;
    case -32603:
      message = i18n.t('metamask-invalid-address');
      break;
    case 4001:
      message = i18n.t('metamask-denied-signature');
      break;
    default:
      if (err.message.slice(0, 66) === 'WalletMiddleware - Invalid "from" address.\n{\n  "originalError": {}') {
        message = i18n.t('metamask-invalid-address');
      } else {
        message = err.message;
      }
  }
  displayModal(
    true,
    {
      icon: logo,
      title: i18n.t('wallet'),
      message,
      cancel: i18n.t('close'),
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
