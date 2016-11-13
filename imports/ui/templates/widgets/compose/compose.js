import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { createContract } from '/imports/startup/both/modules/Contract';
import { animationSettings } from '/imports/ui/modules/animation';
import './compose.html';

Template.compose.rendered = function rendered() {
  $('.action-label').css('opacity', 0);
  $('.action-label').css('overflow', 'hidden');
  $('.action-icon-mouseover').css('opacity', 0);
};

Template.compose.helpers({
  mouseActive: function () {
    return Session.get('showCompose');
  },
  proposalDrafting: function () {
    if (Meteor.settings.public.app.config.proposalDrafting == false) {
      return false;
    }
    return true;
  }
});

Template.compose.events({
  'mouseover #action-hotspace': function () {
    Session.set('showCompose', true)
    animationIntro();
  },
  'mouseleave #action-hotspace': function () {
    Session.set('showCompose', false)
    animationExit();
  },
  'click #action-hotspace': function () {
    createContract();
  }
});

let animationIntro = () => {
  $('.action-icon-mouseleave').velocity({'opacity': 0 }, animationSettings);
  $('.action-icon-mouseover').velocity({'opacity': 1, complete: function () {} }, animationSettings);
  $('.action-label').velocity({'opacity': 1, 'margin-left': '-135px', 'width': '120px' }, animationSettings);
}

let animationExit = () => {
  $('.action-icon-mouseleave').velocity({'opacity': 1 }, animationSettings);
  $('.action-icon-mouseover').velocity({'opacity': 0 }, animationSettings);
  $('.action-label').velocity({'opacity': 0, 'margin-left': -115, 'width': '0px' }, animationSettings);
}
