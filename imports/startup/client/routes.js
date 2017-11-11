import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';

import { gui } from '/lib/const';
import '/imports/ui/templates/layout/main.js';
import '/imports/ui/templates/layout/url/home/home.js';
import '/imports/ui/templates/layout/url/notFound/notFound.js';
import '/imports/ui/templates/layout/load/load.js';
import '/imports/ui/templates/components/identity/login/login.js';
import '/imports/ui/templates/components/identity/card/card.js';
import '/imports/ui/templates/components/decision/contract/contract.js';
import '/imports/ui/templates/widgets/feed/feed.js';
import { Contracts } from '../../api/contracts/Contracts';
import { fn } from './functions';

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
/*
TODO: review this whole thing.. if possible: remove from here
    if (Meteor.settings.public.Collective) {
      fn.clearSessionVars();
      fn.configNavbar(Meteor.settings.public.Collective.name, '/');
      fn.setSessionVars();
    }    */
    this.next();
  },
  data() {
    return {
      query: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' } },
      options: { view: 'latest', sort: { createdAt: -1 }, limit: gui.ITEMS_PER_PAGE, skip: 0 },
      skip: 0,
      limit: gui.ITEMS_PER_PAGE,
    };
  },
});

/**
* @summary loads a peer feed
****/
Router.route('/peer/:username', {
  name: 'peerFeed',
  template: 'home',
  waitOn() {
    return [Meteor.subscribe('contracts', fn.buildQuery(this.params)), Meteor.subscribe('userData'), Meteor.subscribe('transactions')];
  },
  onBeforeAction() {
    fn.clearSessionVars();
    fn.configNavbar(fn.buildTitle(this.params), '/peer');
    fn.setSessionVars();
    this.next();
  },
  data() {
    const feedQuery = fn.buildQuery(this.params);
    return {
      skip: 0,
      limit: gui.ITEMS_PER_PAGE,
      query: feedQuery,
      sort: { createdAt: -1 },
      count: Contracts.find(feedQuery).count(),
    };
  },
});

/**
* routing for feeds displaying contracts
* NOTE: called when item clicked on sidebar menu
**/
Router.route('/:feed', {
  name: 'homeFeed',
  template: 'home',
  waitOn() {
    return [Meteor.subscribe('contracts', fn.buildQuery(this.params.query)), Meteor.subscribe('userData'), Meteor.subscribe('transactions')];
  },
  onBeforeAction() {
    if (this.params.feed === 'feed') {
      fn.clearSessionVars();
      fn.configNavbar(fn.buildTitle(this.params.query), '/');
      fn.setSessionVars(this.params);
      Session.set('feed', Contracts.find(fn.buildQuery(this.params.query), { sort: { createdAt: -1 } }).fetch());
      this.next();
    } else {
      this.render('notFound');
    }
  },
});

/**
* @summary loads a tag feed
****/
Router.route('/tag/:tag', {
  name: 'tagFeed',
  template: 'home',
  waitOn() {
    return [Meteor.subscribe('contracts', fn.buildQuery(this.params)), Meteor.subscribe('userData')];
  },
  onBeforeAction() {
    fn.clearSessionVars();
    fn.configNavbar(fn.buildTitle(this.params), '/tag');
    fn.setSessionVars();
    Session.set('feed', Contracts.find(fn.buildQuery(this.params), { sort: { createdAt: -1 } }).fetch());
    this.next();
  },
});

/**
* @summary loads a contract meant for voting either to edit or vote.
*/
Router.route('/vote/:contract', {
  name: 'voteContract',
  template: 'contract',
  waitOn() {
    return [Meteor.subscribe('contracts', fn.buildQuery(this.params.query)), Meteor.subscribe('userData'), Meteor.subscribe('transactions')];
  },
  onBeforeAction() {
    fn.clearSessionVars();
    fn.configNavbar(fn.buildTitle(this.params.contract), '/vote');
    fn.setSessionVars(this.params);
    this.next();
  },
});

/*
* loads a contract meant for delegation of votes.
****/
Router.route('/delegation/:contract', {
  name: 'delegationContract',
  template: 'contract',
  waitOn() {
    if (this.params.contract === 'draft') {
      return [Meteor.subscribe('contracts', { keyword: this.params.contract }), Meteor.subscribe('userData'), Meteor.subscribe('tags')];
    }
    return [Meteor.subscribe('contracts', { keyword: this.params.contract }), Meteor.subscribe('userData')];
  },
  onBeforeAction() {
    fn.clearSessionVars();
    fn.configNavbar(TAPi18n.__('navbar-delegation'), '/delegation');
    fn.setSessionVars(this.params);
    this.next();
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
