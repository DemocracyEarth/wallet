import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';

import '/imports/ui/templates/layout/url/home/home.html';
import '/imports/ui/templates/widgets/feed/feed.js';
import '/imports/ui/templates/widgets/tally/tally.js';
import '/imports/ui/templates/widgets/feed/paginator.js';
import '/imports/ui/templates/widgets/compose/compose.js';

Template.home.onCreated(function () {
  this.modeVar = new ReactiveVar();

  this.autorun(() => {
    Template.instance().modeVar.set(Router.current().url);
  });
});

Template.home.onRendered(() => {
  Session.set('editorMode', false);
});

Template.home.helpers({
  editorMode() {
    return Session.get('showPostEditor');
  },
  newContractId() {
    if (Session.get('draftContract')) {
      return Session.get('draftContract')._id;
    }
    return undefined;
  },
  modeArray() {
    return [Template.instance().modeVar.get()];
  },
  content() {
    return {
      template: 'feed',
      dataObject: this,
    };
  },
});

Template.screen.helpers({
  tag() {
    console.log((this.options.view === 'tag'));
    console.log(this.options);
    return (this.options.view === 'tag');
  },
  peer() {
    return (this.options.view === 'peer');
  },
  home() {
    return (this.options.view === 'latest');
  },
  post() {
    return (this.options.view === 'post');
  },
});

Template.peerFeed.helpers({
  votes() {
    console.log(this);
    const tally = this;
    tally.options.view = 'userVotes';
    tally.options.sort = { timestamp: -1 };
    return tally;
  },
});

Template.homeFeed.helpers({
  editorMode() {
    return Session.get('showPostEditor');
  },
  newContractId() {
    if (Session.get('draftContract')) {
      return Session.get('draftContract')._id;
    }
    return undefined;
  },
});

Template.postFeed.helpers({
  votes() {
    const tally = this;
    tally.options.view = 'votes';
    tally.options.sort = { timestamp: -1 };
    return tally;
  },
});
