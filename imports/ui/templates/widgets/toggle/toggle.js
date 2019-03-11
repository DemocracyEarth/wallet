import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';

import { Contracts } from '/imports/api/contracts/Contracts';
import { animationSettings } from '/imports/ui/modules/animation';
import { getRightToVote } from '/imports/ui/modules/ballot';

import './toggle.html';

const toggleMap = {};

function toggle(node, value, animate) {
  if (animate) {
    if (value) {
      node
        .velocity('stop')
        .velocity({ 'margin-left': '2px' }, animationSettings)
        .velocity({ 'margin-left': '42px' }, animationSettings)
        .velocity('stop');

      node.parent().first()
        .velocity('stop')
        .velocity({ backgroundColor: '#ccc' }, animationSettings)
        .velocity({ backgroundColor: '#00bf8f' }, animationSettings)
        .velocity('stop');
    } else {
      node
        .velocity('stop')
        .velocity({ 'margin-left': '42px' }, animationSettings)
        .velocity({ 'margin-left': '2px' }, animationSettings)
        .velocity('stop');

      node.parent().first()
        .velocity('stop')
        .velocity({ backgroundColor: '#00bf8f' }, animationSettings)
        .velocity({ backgroundColor: '#ccc' }, animationSettings)
        .velocity('stop');
    }
  } else if (!animate) {
    if (value) {
      node
        .css('margin-left', '42px');
      node.parent().first()
        .css('background-color', '#00bf8f');
    } else {
      node
        .css('margin-left', '2px');
      node.parent().first()
        .css('background-color', '#ccc');
    }
  }
}

function displayToggle() {
  for (const item in toggleMap) {
    const node = $(`.${item}`).children();
    toggle(node, toggleMap[item], false);
  }
}

Template.toggle.onRendered(() => {
  displayToggle();
  Session.set('clickedToggle', this.setting);
});

Template.toggle.onCreated(() => {
});

Template.toggle.helpers({
  setting() {
    toggleMap[this.setting] = this.value;
    displayToggle();
    return this.setting;
  },
});

Template.toggle.events({
  'click #toggleButton'() {
    if (!Template.instance().rightToVote.get() || Template.instance().contract.get().stage === 'DRAFT') {
      Session.set('clickedToggle', this.setting);
      toggle($(`.${this.setting}`).children(), !this.value, true);
      const obj = {};
      obj[this.setting] = !this.value;
      Contracts.update(Template.instance().contract.get()._id, { $set: obj });
    }
  },
});
