import { Session } from 'meteor/session';
import { globalObj } from '/lib/global';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { timers } from '/lib/const';

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

/**
* @summary displays an alert activity
* @param {string} message with alert to show
* @param {number} milliseconds for the message to last
*/
const _alert = (message, milliseconds) => {
  const queue = Session.get('alert') ? Session.get('alert') : [];
  const id = parseInt(Math.random(0) * 10000, 10);
  queue.push({
    id,
    message,
    milliseconds,
    timestamp: new Date(),
  });
  Session.set('alert', queue);

  Meteor.setTimeout(() => {
    $(`#alert-${id}`).velocity({ opacity: 0 }, {
      duration: timers.ANIMATION_DURATION,
      complete() {
        let alerts = Session.get('alert');
        alerts = _.reject(alerts, (num) => { return (num.id === id); });
        Session.set('alert', alerts);
      },
    });
  }, milliseconds || timers.ANIMATION_DURATION);
};


export const displayModal = modal;
export const alert = _alert;
export default modalCallback;
