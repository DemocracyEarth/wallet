import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { editorFadeOut } from '/imports/ui/templates/components/decision/editor/editor';
import { createContract } from '/imports/startup/both/modules/Contract';
import { animationSettings } from '/imports/ui/modules/animation';
import './compose.html';


const animationIntro = () => {
  $('.action-icon-mouseleave').velocity({ opacity: 0 }, animationSettings);
  $('.action-icon-mouseover').velocity({ opacity: 1 }, animationSettings);
  $('.action-label').velocity({ opacity: 1, 'margin-left': '-135px', width: '120px' }, animationSettings);
};

const animationExit = () => {
  $('.action-icon-mouseleave').velocity({ opacity: 1 }, animationSettings);
  $('.action-icon-mouseover').velocity({ opacity: 0 }, animationSettings);
  $('.action-label').velocity({ opacity: 0, 'margin-left': -115, width: '0px' }, animationSettings);
};

/**
* @summary prepares the territory for editor display
*/
const _introEditor = () => {
  if (!Session.get('showPostEditor')) {
    Session.set('draftContract', createContract());
    Session.set('showPostEditor', true);
  } else if (!Meteor.Device.isPhone()) {
    editorFadeOut(Session.get('draftContract')._id);
  }
};

Template.compose.onRendered(() => {
  if (!Meteor.Device.isPhone()) {
    $('.action-label').css('opacity', 0);
    $('.action-label').css('overflow', 'hidden');
    $('.action-icon-mouseover').css('opacity', 0);
  }
});

Template.compose.helpers({
  mouseActive() {
    if (!Meteor.Device.isPhone()) {
      return Session.get('showCompose');
    }
    return false;
  },
  proposalDrafting() {
    if (Meteor.settings.public.app.config.proposalDrafting === false) {
      return false;
    }
    return true;
  },
  displayCancel() {
    if (Session.get('showPostEditor') && !Meteor.Device.isPhone()) {
      return 'cast-cancel';
    }
    return '';
  },
  icon() {
    if (Session.get('showPostEditor') && !Meteor.Device.isPhone()) {
      return 'images/compose-cancel.png';
    }
    return 'images/compose.png';
  },
});

Template.compose.events({
  'click #action-hotspace'() {
    _introEditor();
  },
});
