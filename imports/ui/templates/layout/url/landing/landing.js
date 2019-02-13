import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import { promptLogin } from '/imports/ui/templates/components/collective/collective.js';

import '/imports/ui/templates/layout/url/landing/landing.html';

Template.team.onCreated(function () {
  Template.instance().showVideo = new ReactiveVar(false);
})

Template.team.events({
  'click #community-join'() {
    event.stopPropagation();
    promptLogin((!Session.get('user-login') || !Session.get('user-login').visible), event);
  },
  'click #hello-video'() {
    const state = !Template.instance().showVideo.get();
    Template.instance().showVideo.set(state);
    if (state) {
      if (Meteor.Device.isPhone()) {
        document.getElementById('democracy-video').webkitEnterFullscreen();
      }
      document.getElementById('democracy-video').play();
    }
  },
  'click #video-modal'() {
    Template.instance().showVideo.set(false);
    document.getElementById('democracy-video').pause();
  },
});

Template.team.helpers({
  showVideo() {
    if (!Template.instance().showVideo.get()) {
      return 'display: none';
    }
    return '';
  },
  modalVideo() {
    if (!Template.instance().showVideo.get()) {
      return 'display: none';
    }
    return 'opacity: 1; background-color:rgba(0, 0, 0, .8);';
  },
});
