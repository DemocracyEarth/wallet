import { Session } from 'meteor/session';
import { globalObj } from '/lib/global';

let modalCallback;

/**
* @summary displays modal menu
* @param {boolean} active activate modal window
* @param {object} settings settings for content display
* @param {function} callback if approved, execute this
* @param {function} cancel if cancelled, then execute this
*/
const modal = (active, settings, callback, cancel) => {
  Session.set('displayModal', settings);
  Session.set('showModal', active);

  if (callback !== undefined) {
    globalObj.modalCallback = callback;
  }
  if (cancel !== undefined) {
    globalObj.modalCancel = cancel;
  } else {
    globalObj.modalCancel = undefined;
  }
};

export const displayModal = modal;
export default modalCallback;
