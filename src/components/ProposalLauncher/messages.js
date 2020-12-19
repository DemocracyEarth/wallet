import i18n from 'i18n';
import logo from 'images/logo.png';

const modalContent = {
  prposalSubmitted: {
    icon: logo,
    title: i18n.t("proposal-submitted"),
    message: i18n.t("proposal-submitted-successfully"),
    cancelLabel: i18n.t('close'),
    mode: 'ALERT'
  },
  noTokens: {
    icon: logo,
    title: i18n.t("api-error"),
    message: i18n.t("api-error-tokens"),
    cancelLabel: i18n.t('close'),
    mode: 'ALERT'
  }
};

/**
* @summary successfully submitted message;
*/
const _prposalSubmitted = () => {
  // submit proposal returned receipt
  window.modal = modalContent.prposalSubmitted;
  window.showModal.value = true;
};

/**
* @summary tokens subgraph not available;
*/
const _noTokens = () => {
  // no access to subgraph API
  window.modal = modalContent.noTokens;
  window.showModal.value = true;
};

export const prposalSubmitted = _prposalSubmitted;
export const noTokens = _noTokens;
