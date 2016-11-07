import { Template } from 'meteor/templating';
import { toggleSelectedItem } from '../../../modules/menu';

import './inbox.html';

Template.inbox.helpers({
  selected: function () {
    if (this.selected) {
      return 'menu-item-selected';
    } else {
      return '';
    }
  },
  signalStyle: function () {
    if (this.value > 0) {
      return '';
    } else {
      if (this.selected) {
        return 'signal-selected void'
      } else {
        return 'void';
      }
    }
  },
  isAvatar: function () {
    return this.isAvatar;
  }
});

Template.inbox.events({
  'click #menuButton': function (event) {
    Session.set('sidebarMenuSelectedId', this.id);
    if (typeof this.id == 'string') {
      toggleSelectedItem(Session.get('menuDelegates'));
    } else {
      toggleSelectedItem(Session.get('menuDecisions'));
    }
  }
});
