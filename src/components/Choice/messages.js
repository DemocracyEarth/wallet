import i18n from 'i18n';
import logo from 'images/logo.png';


const modalContent = {
  default: {
    icon: logo,
    title: i18n.t('wallet'),
    cancelLabel: i18n.t('close'),
    mode: 'ALERT'
  },
  notMember: {
    icon: logo,
    title: i18n.t('moloch-not-member'),
    message: i18n.t('moloch-alert-not-member'),
    cancelLabel: i18n.t('close'),
    mode: 'ALERT'
  },
  notSynced: {
    icon: logo,
    title: i18n.t('not-synced'),
    message: i18n.t('not-synced-message'),
    cancelLabel: i18n.t('close'),
    mode: 'ALERT',
  },
  notLogged: {
    icon: logo,
    title: i18n.t('place-vote'),
    message: i18n.t('unlogged-cant-vote'),
    cancelLabel: i18n.t('close'),
    mode: 'ALERT'
  },
  pollClosed: {
    icon: logo,
    title: i18n.t('poll-closed'),
    message: i18n.t('poll-is-closed'),
    cancelLabel: i18n.t('close'),
    mode: 'ALERT'
  },
  alreadyVoted: {
    icon: logo,
    title: i18n.t('already-voted'),
    message: i18n.t('already-voted-detail'),
    cancelLabel: i18n.t('close'),
    mode: 'ALERT'
  },
  noWallet: {
    icon: logo,
    title: i18n.t('no-wallet'),
    message: i18n.t('no-wallet-message'),
    cancelLabel: i18n.t('close'),
    mode: 'ALERT'
  },
  walletError: {
    icon: logo,
    title: i18n.t('wallet'),
    cancelLabel: i18n.t('close'),
    mode: 'ALERT',
  }
};

/**
* @summary reject vote message;
*/
const _notMember = () => {
  // not member of dao
  window.modal = modalContent.notMember;
  window.showModal.value = true;
};

/**
* @summary not synced chain message;
*/
const _notSynced = () => {
  // not synced
  window.modal = modalContent.notSynced;
  window.showModal.value = true;

};

const _notLogged = () => {
  // not logged
  window.modal = modalContent.notLogged;
  window.showModal.value = true;
};

/**
* @summary poll no longer open;
*/
const _pollClosed = () => {
  // poll already closed
  window.modal = modalContent.pollClosed;
  window.showModal.value = true;
};

/**
* @summary already voted here
*/
const _alreadyVoted = () => {
  // poll already closed
  window.modal = modalContent.alreadyVoted;
  window.showModal.value = true;
};

/**
* @summary couldn't find web3 wallet
*/
const _noWallet = () => {
  // no wallet
  window.modal = modalContent.noWallet;
  window.showModal.value = true;
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


  let error = modalContent.walletError;
  error.message = message;
  window.modal = error;
  window.showModal.value = true;
};

export const walletError = _walletError;
export const noWallet = _noWallet;
export const alreadyVoted = _alreadyVoted;
export const pollClosed = _pollClosed;
export const notLogged = _notLogged;
export const notSynced = _notSynced;
export const notMember = _notMember;
