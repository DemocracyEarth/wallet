import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';
import { DocHead } from 'meteor/kadira:dochead';
import { TAPi18n } from 'meteor/tap:i18n';

import { gui } from '/lib/const';
import { Contracts } from '/imports/api/contracts/Contracts';

import '/imports/ui/templates/layout/main.js';
import '/imports/ui/templates/layout/url/home/home.js';
import '/imports/ui/templates/layout/url/notFound/notFound.js';
import '/imports/ui/templates/layout/load/load.js';
import '/imports/ui/templates/components/identity/login/login.js';
import '/imports/ui/templates/components/identity/card/card.js';
import '/imports/ui/templates/components/decision/contract/contract.js';
import '/imports/ui/templates/widgets/feed/feed.js';


/**
* @summary writes meta tags in HTML page
* @param {object} tag includes a key value for each tag
*/
const _meta = (tag) => {
  DocHead.addMeta({ name: 'description', content: tag.description });
  DocHead.addMeta({ property: 'og:title', content: tag.title });
  DocHead.addMeta({ property: 'og:description', content: tag.description });
  DocHead.addMeta({ property: 'og:image', content: tag.image });
  DocHead.addMeta({ property: 'twitter:card', content: tag.description });
  DocHead.addMeta({ name: 'twitter:card', content: 'summary' });
  DocHead.addMeta({ name: 'twitter:site', content: tag.twitter });
  DocHead.addMeta({ name: 'twitter:title', content: tag.title });
  DocHead.addMeta({ name: 'twitter:description', content: tag.description });
  DocHead.addMeta({ name: 'twitter:image', content: tag.image });
};

/**
* @summary default meta tags
*/
const _boilerPlate = () => {
  DocHead.removeDocHeadAddedTags();
  DocHead.setTitle(`${Meteor.settings.public.Collective.name} - ${Meteor.settings.public.Collective.profile.bio}`);

  _meta({
    title: `${Meteor.settings.public.Collective.name} - ${Meteor.settings.public.Collective.profile.bio}`,
    description: Meteor.settings.public.Collective.profile.bio,
    image: `${Router.path('home')}${Meteor.settings.public.Collective.profile.logo}`,
    twitter: Meteor.settings.public.Collective.profile.twitter,
  });
};

/**
* @summary all the usernames mentioned in a contract
* @param {object} contract to parse
* @returns {string} list with all @names
*/
const _getAllUsernames = (contract) => {
  let list = '';
  for (const i in contract.signatures) {
    list += `@${contract.signatures[i].username} `;
  }
  return list;
};

/**
* @summary title case for any string
* @param {string} str title this
* @returns {string} with Title Case
*/
const _toTitleCase = (str) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
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
    _boilerPlate();
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
  onAfterAction() {
    const user = Meteor.users.findOne({ username: this.params.username });
    let title;
    let description;
    let image;
    DocHead.removeDocHeadAddedTags();

    if (user) {
      title = `@${user.username}${TAPi18n.__('profile-tag-title')} ${Meteor.settings.public.Collective.name}`;
      description = `@${user.username}${TAPi18n.__('profile-tag-description')} ${Meteor.settings.public.Collective.name}`;
      image = `${Router.path('home')}${user.profile.picture}`;
    } else {
      title = `@${this.params.username} ${TAPi18n.__('profile-tag-title')} ${Meteor.settings.public.Collective.name}`;
      description = `@${this.params.username} ${TAPi18n.__('profile-tag-description')} ${Meteor.settings.public.Collective.name}`;
      image = `${Router.path('home')}${Meteor.settings.public.Collective.profile.logo}`;
    }

    DocHead.setTitle(title);

    _meta({
      title,
      description,
      image,
      twitter: Meteor.settings.public.Collective.profile.twitter,
    });
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
  onAfterAction() {
    const contract = Contracts.findOne({ keyword: this.params.keyword });
    let title;
    let description;
    let image;
    DocHead.removeDocHeadAddedTags();

    if (contract) {
      DocHead.setTitle(`${_getAllUsernames(contract)}${TAPi18n.__('vote-tag-ballot-title')} "${contract.title}"`);
      if (contract.ballotEnabled) {
        title = `${_getAllUsernames(contract)}${TAPi18n.__('vote-tag-ballot-title')} ${Meteor.settings.public.Collective.name}`;
      } else {
        title = `${_getAllUsernames(contract)}${TAPi18n.__('vote-tag-title')} ${Meteor.settings.public.Collective.name}`;
      }
      description = contract.title;
      image = `${Router.path('home')}${Meteor.settings.public.Collective.profile.logo}`;
    } else {
      title = `${Meteor.settings.public.Collective.name} - ${Meteor.settings.public.Collective.profile.bio}`;
      description = Meteor.settings.public.Collective.profile.bio;
      image = `${Router.path('home')}${Meteor.settings.public.Collective.profile.logo}`;
      DocHead.setTitle(title);
    }

    _meta({
      title,
      description,
      image,
      twitter: Meteor.settings.public.Collective.profile.twitter,
    });
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
  onAfterAction() {
    DocHead.removeDocHeadAddedTags();
    DocHead.setTitle(`#${this.params.hashtag} ${TAPi18n.__('hashtag-tag-title')} ${Meteor.settings.public.Collective.name}`);

    _meta({
      title: `#${this.params.hashtag}${TAPi18n.__('hashtag-tag-title')} ${Meteor.settings.public.Collective.name}`,
      description: `#${this.params.hashtag}${TAPi18n.__('hashtag-tag-description')} ${Meteor.settings.public.Collective.name}.`,
      image: `${Router.path('home')}${Meteor.settings.public.Collective.profile.logo}`,
      twitter: Meteor.settings.public.Collective.profile.twitter,
    });
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
  onAfterAction() {
    DocHead.removeDocHeadAddedTags();
    const country = _toTitleCase(this.params.country);

    DocHead.setTitle(`${country} ${TAPi18n.__('country-tag-title')} ${Meteor.settings.public.Collective.name}`);
    _meta({
      title: `${country} ${TAPi18n.__('country-tag-title')} ${Meteor.settings.public.Collective.name}`,
      description: `${country}${TAPi18n.__('country-tag-description')} ${Meteor.settings.public.Collective.name}.`,
      image: `${Router.path('home')}${Meteor.settings.public.Collective.profile.logo}`,
      twitter: Meteor.settings.public.Collective.profile.twitter,
    });
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
  onAfterAction() {
    _boilerPlate();
  },
});

// Login
Router.route('/login', {
  name: 'login',
});
