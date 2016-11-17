import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { Contracts } from '/imports/api/contracts/Contracts';
import { animationSettings } from '/imports/ui/modules/animation';

import './toggle.html';

let clickedToggle = '';
let toggleMap = {};

Template.toggle.rendered = () => {
  displayToggle();
  Session.set('clickedToggle', this.setting);
};

Template.toggle.helpers({
  value() {
    if (this.setting === Session.get('clickedToggle')) {
      var node = $('.' + this.setting).children();
      toggle(node, this.value, false);
    } else {
      if (toggleMap[this.setting] === undefined) {
        toggleMap[this.setting] = this.value;
      }
    }
    // return this.value;
  },
  setting() {
    //console.log('this setting: ' + this.setting + ' valule:' + this.value);
    toggleMap[this.setting] = this.value;
    displayToggle();
    return this.setting;
  },
});

Template.toggle.events({
  "click #toggleButton": function (event) {
    //clickedToggle = this.setting;
    if (!Session.get('rightToVote') || Session.get('contract').stage === 'DRAFT') {
      Session.set('clickedToggle', this.setting);
      toggle($('.' + this.setting).children(), !this.value, true);
      const obj = {};
      obj[this.setting] = !this.value;
      Contracts.update(Session.get('contract')._id, { $set: obj });
    }
  }
});

function displayToggle() {
  for (let item in toggleMap) {
    const node = $('.' + item).children();
    toggle(node, toggleMap[item], false);
  }
}


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
