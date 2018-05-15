import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';
import { DocHead } from 'meteor/kadira:dochead';

import { gui } from '/lib/const';

import '/imports/ui/templates/layout/main.js';
import '/imports/ui/templates/layout/url/home/home.js';
import '/imports/ui/templates/layout/url/notFound/notFound.js';
import '/imports/ui/templates/layout/load/load.js';
import '/imports/ui/templates/components/identity/login/login.js';
import '/imports/ui/templates/components/identity/card/card.js';
import '/imports/ui/templates/components/decision/contract/contract.js';
import '/imports/ui/templates/widgets/feed/feed.js';


const _meta = (title, description, image, twitter) => {
  DocHead.setTitle(title);
  DocHead.addMeta({ name: 'description', content: description });
  DocHead.addMeta({ property: 'og:title', content: title });
  DocHead.addMeta({ property: 'og:description', content: description });
  DocHead.addMeta({ property: 'og:image', content: image });
  DocHead.addMeta({ property: 'twitter:card', content: description });
  DocHead.addMeta({ name: 'twitter:card', content: 'summary' });
  DocHead.addMeta({ name: 'twitter:site', content: twitter });
  DocHead.addMeta({ name: 'twitter:title', content: title });
  DocHead.addMeta({ name: 'twitter:description', content: description });
  DocHead.addMeta({ name: 'twitter:image', content: image });
};


/*
* router settings
*/
Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'load',
  notFoundTemplate: 'notFound',
});

/**
* @summary home route
*/
Router.route('/', {
  name: 'home',
  template: 'home',
  loadingTemplate: 'load',
  onBeforeAction() {
    this.next();
  },
  data() {
    return {
      options: { view: 'latest', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0 },
    };
  },
  onAfterAction() {
    _meta(
      Meteor.settings.public.Collective.name,
      Meteor.settings.public.Collective.profile.bio,
      `${Router.path('home')}${Meteor.settings.public.Collective.profile.logo}`,
      Meteor.settings.public.Collective.profile.twitter
    );
  },
});

/**
* @summary loads a peer feed
**/
Router.route('/peer/:username', {
  name: 'peerFeed',
  template: 'home',
  onBeforeAction() {
    this.next();
  },
  data() {
    let settings;
    const user = Meteor.users.findOne({ username: this.params.username });
    if (!user) {
      settings = {
        username: this.params.username,
      };
    } else {
      settings = {
        userId: user._id,
      };
    }
    return {
      options: { view: 'peer', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0, userId: settings.userId, username: settings.username },
    };
  },
});

/**
* @summary loads a post
**/
Router.route('/vote/:keyword', {
  name: 'post',
  template: 'home',
  onBeforeAction() {
    this.next();
  },
  data() {
    return {
      options: { view: 'post', sort: { createdAt: -1 }, keyword: this.params.keyword },
    };
  },
});


/**
* @summary loads a tag feed
**/
Router.route('/tag/:hashtag', {
  name: 'tagFeed',
  template: 'home',
  onBeforeAction() {
    this.next();
  },
  data() {
    return {
      options: { view: 'tag', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0, tag: this.params.hashtag },
    };
  },
});

/**
* @summary loads a tag feed
**/
Router.route('/geo/:country', {
  name: 'geoFeed',
  template: 'home',
  onBeforeAction() {
    this.next();
  },
  data() {
    return {
      options: { view: 'geo', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0, country: this.params.country },
    };
  },
});

/**
* @summary loads a token feed
**/
Router.route('/token/:hashtag', {
  name: 'tokenFeed',
  template: 'home',
  onBeforeAction() {
    this.next();
  },
  data() {
    return {
      options: { view: 'tag', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0, tag: this.params.hashtag },
    };
  },
});

// Email routes
Router.route('/verify-email/:token', {
  name: 'verify-email',
  onBeforeAction() {
    Session.set('emailToken', this.params.token);
    this.next();
  },
});

// Login
Router.route('/login', {
  name: 'login',
});
