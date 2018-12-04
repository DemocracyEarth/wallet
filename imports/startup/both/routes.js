import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';
import { DocHead } from 'meteor/kadira:dochead';
import { TAPi18n } from 'meteor/tap:i18n';

import { gui } from '/lib/const';
import { urlDoctor, toTitleCase } from '/lib/utils';
import { Contracts } from '/imports/api/contracts/Contracts';
import { stripHTMLfromText } from '/imports/ui/modules/utils';
import { setupWeb3 } from '/imports/startup/both/modules/metamask.js';

if (Meteor.isClient) {
  import '/imports/ui/templates/layout/main.js';
  import '/imports/ui/templates/layout/url/home/home.js';
  import '/imports/ui/templates/layout/url/notFound/notFound.js';
  import '/imports/ui/templates/layout/load/load.js';
  import '/imports/ui/templates/components/identity/login/login.js';
  import '/imports/ui/templates/components/identity/card/card.js';
  import '/imports/ui/templates/components/decision/contract/contract.js';
  import '/imports/ui/templates/widgets/feed/feed.js';
}

/**
* @summary writes meta tags in HTML page
* @param {object} tag includes a key value for each tag
* @param {boolean} includeTitle if including title on head is required
*/
const _meta = (tag, includeTitle) => {
  if (Meteor.isServer) {
    let head = `
      <meta name="description" content="${tag.description}">
      <meta property="og:title" content="${tag.title}">
      <meta property="og:description" content="${tag.description}">
      <meta property="og:image" content="${tag.image}">
      <meta property="twitter:card" content="${tag.description}">
      <meta name="twitter:card" content='summary'>
      <meta name="twitter:site" content="${tag.twitter}">
      <meta name="twitter:title" content="${tag.title}">
      <meta name="twitter:description" content="${tag.description}">
      <meta name="twitter:image" content="${tag.image}">
      <meta property="fb:app_id" content="${tag.facebookId}">
      `;

    if (includeTitle) {
      head += `
        <title>${tag.title}</title>
      `;
    }
    return head;
  }
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
  DocHead.addMeta({ property: 'fb:app_id', content: tag.facebookId });
  return '';
};

/**
* @summary resets session variables
*/
const _reset = () => {
  Session.set('castSingleVote', undefined);
  Session.set('newLogin', false);
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
    image: `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${Meteor.settings.public.Collective.profile.logo}`,
    twitter: Meteor.settings.public.Collective.profile.twitter,
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
    _reset();
    this.next();
  },
  data() {
    return {
      options: { view: 'latest', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0 },
    };
  },
  onAfterAction() {
    _boilerPlate();
    if (!setupWeb3(false)) {
      // If user is not logged in to Metamask then logout of Sovereign
      Meteor.logout();
    }
  },
});


/**
* @summary loads a peer feed from @
**/
Router.route('/@:username', {
  name: 'at',
  template: 'home',
  onBeforeAction() {
    _reset();
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
      title = `${TAPi18n.__('profile-tag-title').replace('{{user}}', `@${user.username}`).replace('{{collective}}', Meteor.settings.public.Collective.name)}`;
      description = `@${user.username}${TAPi18n.__('profile-tag-description')} ${Meteor.settings.public.Collective.name}`;
      image = `${Router.path('home')}${user.profile.picture}`;
    } else {
      title = `${TAPi18n.__('profile-tag-title').replace('{{user}}', `@${this.params.username}`).replace('{{collective}}', Meteor.settings.public.Collective.name)}`;
      description = `@${this.params.username} ${TAPi18n.__('profile-tag-description')} ${Meteor.settings.public.Collective.name}`;
      image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${Meteor.settings.public.Collective.profile.logo}`;
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
* @summary loads a peer feed
**/
Router.route('/peer/:username', {
  name: 'peerFeed',
  template: 'home',
  onBeforeAction() {
    _reset();
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
      title = `${TAPi18n.__('profile-tag-title').replace('{{user}}', `@${user.username}`).replace('{{collective}}', Meteor.settings.public.Collective.name)}`;
      description = `@${user.username}${TAPi18n.__('profile-tag-description')} ${Meteor.settings.public.Collective.name}`;
      image = `${Router.path('home')}${user.profile.picture}`;
    } else {
      title = `${TAPi18n.__('profile-tag-title').replace('{{user}}', `@${this.params.username}`).replace('{{collective}}', Meteor.settings.public.Collective.name)}`;
      description = `@${this.params.username} ${TAPi18n.__('profile-tag-description')} ${Meteor.settings.public.Collective.name}`;
      image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${Meteor.settings.public.Collective.profile.logo}`;
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
* @summary loads a post using date in url
**/
Router.route('/:year/:month/:day/:keyword', {
  name: 'date',
  template: 'home',
  onBeforeAction() {
    _reset();
    this.next();
  },
  data() {
    const url = `/${this.params.year}/${this.params.month}/${this.params.day}/${this.params.keyword}`;
    return {
      options: { view: 'post', sort: { createdAt: -1 }, url, keyword: this.params.keyword },
    };
  },
  onAfterAction() {
    const contract = Contracts.findOne({ keyword: this.params.keyword });
    let title;
    let description;
    let image;
    DocHead.removeDocHeadAddedTags();

    if (contract) {
      DocHead.setTitle(`${TAPi18n.__('vote-tag-ballot-title').replace('{{collective}}', Meteor.settings.public.Collective.name)} - ${stripHTMLfromText(contract.title)}`);
      if (contract.ballotEnabled) {
        title = `${TAPi18n.__('vote-tag-ballot-title').replace('{{collective}}', Meteor.settings.public.Collective.name)}`;
      } else {
        title = `${TAPi18n.__('vote-tag-title').replace('{{collective}}', Meteor.settings.public.Collective.name)}`;
      }
      description = stripHTMLfromText(contract.title);
      image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${Meteor.settings.public.Collective.profile.logo}`;
    } else {
      title = `${Meteor.settings.public.Collective.name} - ${Meteor.settings.public.Collective.profile.bio}`;
      description = Meteor.settings.public.Collective.profile.bio;
      image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${Meteor.settings.public.Collective.profile.logo}`;
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
* @summary loads a post
**/
Router.route('/vote/:keyword', {
  name: 'post',
  template: 'home',
  onBeforeAction() {
    _reset();
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
      DocHead.setTitle(`${TAPi18n.__('vote-tag-ballot-title').replace('{{collective}}', Meteor.settings.public.Collective.name)} - ${stripHTMLfromText(contract.title)}`);
      if (contract.ballotEnabled) {
        title = `${TAPi18n.__('vote-tag-ballot-title').replace('{{collective}}', Meteor.settings.public.Collective.name)}`;
      } else {
        title = `${TAPi18n.__('vote-tag-title').replace('{{collective}}', Meteor.settings.public.Collective.name)}`;
      }
      description = stripHTMLfromText(contract.title);
      image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${Meteor.settings.public.Collective.profile.logo}`;
    } else {
      title = `${Meteor.settings.public.Collective.name} - ${Meteor.settings.public.Collective.profile.bio}`;
      description = Meteor.settings.public.Collective.profile.bio;
      image = `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${Meteor.settings.public.Collective.profile.logo}`;
      DocHead.setTitle(title);
    }

    _meta({
      title,
      description,
      image,
      twitter: Meteor.settings.public.Collective.profile.twitter,
    });

    switch (this.params.query.ask) {
      case 'vote':
        Session.set('castSingleVote', this.params.keyword);
        break;
      default:
    }
  },
});


/**
* @summary loads a tag feed
**/
Router.route('/tag/:hashtag', {
  name: 'tagFeed',
  template: 'home',
  onBeforeAction() {
    _reset();
    this.next();
  },
  data() {
    return {
      options: { view: 'tag', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0, tag: this.params.hashtag },
    };
  },
  onAfterAction() {
    DocHead.removeDocHeadAddedTags();
    DocHead.setTitle(`${TAPi18n.__('hashtag-tag-title').replace('{{hashtag}}', this.params.hashtag).replace('{{collective}}', Meteor.settings.public.Collective.name)}`);

    _meta({
      title: `${TAPi18n.__('hashtag-tag-title').replace('{{hashtag}}', this.params.hashtag).replace('{{collective}}', Meteor.settings.public.Collective.name)}`,
      description: `#${this.params.hashtag}${TAPi18n.__('hashtag-tag-description')} ${Meteor.settings.public.Collective.name}.`,
      image: `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${Meteor.settings.public.Collective.profile.logo}`,
      twitter: Meteor.settings.public.Collective.profile.twitter,
    });
  },
});

/**
* @summary loads a tag feed
**/
Router.route('/:land', {
  name: 'geoFeed',
  template: 'home',
  onBeforeAction() {
    _reset();
    this.next();
  },
  data() {
    if (this.params.land.substring(0, 1) === '$') {
      // its a blockchain
      return {
        options: { view: 'token', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0, token: this.params.land.substring(1) },
      };
    } else if (this.params.land.length === 2) {
      // its a country
      return {
        options: { view: 'geo', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0, country: this.params.land },
      };
    }
    // its a tag
    return {
      options: { view: 'tag', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0, tag: this.params.land },
    };
  },
  onAfterAction() {
    if (this.params.land.length === 2) {
      DocHead.removeDocHeadAddedTags();
      const country = toTitleCase(this.params.land);

      DocHead.setTitle(`${TAPi18n.__('country-tag-title').replace('{{country}}', country).replace('{{collective}}', Meteor.settings.public.Collective.name)}`);
      _meta({
        title: `${TAPi18n.__('country-tag-title').replace('{{country}}', country).replace('{{collective}}', Meteor.settings.public.Collective.name)}`,
        description: `${country}${TAPi18n.__('country-tag-description')} ${Meteor.settings.public.Collective.name}.`,
        image: `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${Meteor.settings.public.Collective.profile.logo}`,
        twitter: Meteor.settings.public.Collective.profile.twitter,
      });
    } else {
      DocHead.removeDocHeadAddedTags();
      DocHead.setTitle(`${TAPi18n.__('hashtag-tag-title').replace('{{hashtag}}', this.params.hashtag).replace('{{collective}}', Meteor.settings.public.Collective.name)}`);

      _meta({
        title: `${TAPi18n.__('hashtag-tag-title').replace('{{hashtag}}', this.params.hashtag).replace('{{collective}}', Meteor.settings.public.Collective.name)}`,
        description: `#${this.params.hashtag}${TAPi18n.__('hashtag-tag-description')} ${Meteor.settings.public.Collective.name}.`,
        image: `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${Meteor.settings.public.Collective.profile.logo}`,
        twitter: Meteor.settings.public.Collective.profile.twitter,
      });
    }
  },
});


/**
* @summary loads a token feed
Router.route('/$:token', {
  name: 'tokenFeed',
  template: 'home',
  onBeforeAction() {
    _reset();
    this.next();
  },
  data() {
    return {
      options: { view: 'token', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0, token: this.params.token },
    };
  },
});
**/

// Email routes
Router.route('/verify-email/:token', {
  name: 'verify-email',
  onBeforeAction() {
    _reset();
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

export const meta = _meta;
