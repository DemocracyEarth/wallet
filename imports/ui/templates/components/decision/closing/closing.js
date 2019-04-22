import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';

import { blocktimes } from '/lib/const';
import { animatePopup, displayPopup } from '/imports/ui/modules/popup';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';

import '/imports/ui/templates/components/decision/closing/closing.html';
import '/imports/ui/templates/components/decision/calendar/calendar.js';

const _killPopup = () => {
  if (Session.get('showClosingEditor')) {
    Session.set('showClosingEditor', false);
  } else {
    Session.set('showClosingEditor', true);
  }
  displayPopup($('#closing-button')[0], 'calendar', Meteor.userId(), 'click', 'calendar-popup');
};

/**
* @summary the closing criteria for this post
* @return {string} closing rule
*/
const _draftClosing = () => {
  const draft = Session.get('draftContract');
  const closing = TAPi18n.__('closing-date');
  let status = closing;

  if (draft.rules.alwaysOn) {
    status += ` &#183; ${TAPi18n.__('always-on')}`;
  } else {
    switch (draft.closing.delta) {
      case blocktimes.ETHEREUM_DAY:
        status += ` &#183; ${TAPi18n.__('blockchain-time-daily')}`;
        break;
      case blocktimes.ETHEREUM_WEEK:
        status += ` &#183; ${TAPi18n.__('blockchain-time-weekly')}`;
        break;
      case blocktimes.ETHEREUM_MONTH:
        status += ` &#183; ${TAPi18n.__('blockchain-time-monthly')}`;
        break;
      case blocktimes.ETHEREUM_QUARTER:
        status += ` &#183; ${TAPi18n.__('blockchain-time-quarterly')}`;
        break;
      case blocktimes.ETHEREUM_YEAR:
      default:
        status += ` &#183; ${TAPi18n.__('blockchain-time-annual')}`;
        break;
    }
  }
  return status;
};

Template.closing.onCreated(function () {
  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

Template.closing.onRendered(function () {
  const instance = Template.instance();

  instance.autorun(function () {
    $('.right').scroll(() => {
      if (Session.get('showClosingEditor')) {
        Session.set('showClosingEditor', false);
        animatePopup(false, 'calendar-popup');
      }
    });
  });
});

Template.closing.helpers({
  getImage(pic) {
    if (Session.get('showClosingEditor')) {
      return getImage(Template.instance().imageTemplate.get(), 'calendar-active');
    }
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
  status() {
    return _draftClosing();
  },
  closingId() {
    if (!this.readOnly) {
      return 'closing-button';
    }
    return '';
  },
  icon() {
    if (!this.readOnly) {
      if (Session.get('showClosingEditor')) {
        return 'active';
      }
    }
    return 'enabled';
  },
});

Template.closing.events({
  'click #closing-button'() {
    if (!this.readOnly) {
      _killPopup();
    }
  },
});

