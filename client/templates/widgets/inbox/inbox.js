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
      Modules.client.toggleSelectedItem(Session.get('menuDelegates'));
    } else {
      Modules.client.toggleSelectedItem(Session.get('menuDecisions'));
    }
  }
});
