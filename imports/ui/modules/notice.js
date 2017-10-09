import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { timers } from '/lib/const';

const showNotice = (label, temporary) => {
  Session.set('noticeDisplay', label);
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
