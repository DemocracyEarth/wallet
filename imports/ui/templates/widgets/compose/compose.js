import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { editorFadeOut } from '/imports/ui/templates/components/decision/editor/editor';
import { createContract } from '/imports/startup/both/modules/Contract';

import '/imports/ui/templates/widgets/compose/compose.html';

/**
* @summary prepares the territory for editor display
*/
const _introEditor = (settings) => {
  let draft;
  if (!Session.get('showPostEditor')) {
    draft = createContract();
  } else {
    draft = Session.get('draftContract');
  }
  console.log(settings);
  if (settings.replyMode || !Session.get('showPostEditor')) {
    if (settings.replyMode && settings.replyId) {
      console.log('entering with replyMode Settings');
      draft.replyId = settings.replyId;
    } else {
      console.log('BORRANDO LA JODA');
      draft.replyId = '';
    }
    Session.set('draftContract', draft);
    Session.set('showPostEditor', true);
    console.log('INTRO EDITOR');
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

Template.compose.onCreated(() => {
  const instance = Template.instance();

  if (Meteor.user() && instance.data.desktopMode) {
    _introEditor(instance.data);
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
  editorMode() {
    return Session.get('showPostEditor');
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
    if (Meteor.Device.isPhone()) {
      const inputElement = document.getElementById('hiddenInput');
      inputElement.style.visibility = 'visible'; // unhide the input
      inputElement.focus(); // focus on it so keyboard pops
      inputElement.style.visibility = 'hidden'; // hide it again
    }
    _introEditor(this);
  },
});

export const introEditor = _introEditor;
