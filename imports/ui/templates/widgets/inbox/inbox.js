import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';

import { toggle } from '/imports/ui/templates/layout/navigation/navigation';
import '/imports/ui/templates/components/identity/avatar/avatar.js';

import { toggleSelectedItem } from '../../../modules/menu';
import './inbox.html';

const _matchingContext = (url) => {
  if (url) {
    const current = Router.current().url.replace(window.location.origin, '');
    if ((Router.current().params.username === url.substring(6))
      || (current === url)
    ) {
      return true;
    }
  }
  return false;
};

Template.inbox.helpers({
  selected() {
    return (_matchingContext(this.url)) ? 'menu-item-selected' : '';
  },
  isAvatar() {
    return this.isAvatar;
  },
  displayCount() {
    return this.displayCount;
  },
  count() {
    return this.count;
  },
  sidebarTagStyle() {
    return (_matchingContext(this.url)) ? 'sidebar-tag-selected' : '';
  },
  tokens() {
    const reserve = {
      token: this.reserve.token,
      balance: this.reserve.balance,
      placed: this.reserve.placed,
      available: this.reserve.available,
      disableStake: true,
      disableBar: true,
    };
    return reserve;
  },
});

Template.inbox.events({
  'click #menuButton'() {
    Session.set('sidebarMenuSelectedId', this.id);
    if (typeof this.id === 'string') {
      toggleSelectedItem(Session.get('menuDelegates'));
    } else {
      toggleSelectedItem(Session.get('menuDecisions'));
    }
    if (Meteor.Device.isPhone()) {
      toggle();
    }
  },
});
