import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { timers } from '/lib/const';

import '/imports/ui/templates/widgets/alert/alert.html';

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

Template.alert.helpers({
  signal() {
    return Session.get('alert');
  },
});

export const alert = _alert;