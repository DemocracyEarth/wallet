import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { timers } from '/lib/const';

/**
* @summary shows notice alert
* @param {string} label to be called on TAPi18n
* @param {boolean} temporary if only displayed for a little while
* @param {boolean} richText if it is rich text
*/
const showNotice = (label, temporary, htmlMode) => {
  Session.set('noticeDisplay', { label, htmlMode });
  Session.set('showNotice', true);

  if (temporary) {
    Meteor.setTimeout(() => {
      $('.context').velocity({ opacity: 0 }, {
        complete: () => {
          Session.set('showNotice', false);
        },
      });
    }, timers.WARNING_DURATION);
  }
};

export const displayNotice = showNotice;
