import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';

import '/imports/ui/templates/components/identity/avatar/avatar.js';

import { toggleSelectedItem } from '../../../modules/menu';
import './inbox.html';

Template.inbox.helpers({
  selected() {
    if (this.url) {
      const current = Router.current().url.replace(window.location.origin, '');
      if ((Router.current().params.username === this.url.substring(6))
        || (current === this.url)
      ) {
        return 'menu-item-selected';
      }
    }
    return '';
  },
  isAvatar() {
    return this.isAvatar;
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
  },
});
