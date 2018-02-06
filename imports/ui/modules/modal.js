import { Session } from 'meteor/session';
import { globalObj } from '/lib/global';
import { $ } from 'meteor/jquery';

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
/*
  if (active) {
    $('#content').css('overflow', 'hidden');
    $('.alert').css('overflow', 'scroll');
  } else {
    $('#content').css('overflow', 'scroll');
    $('.alert').css('overflow', 'hidden');
  }
*/

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
