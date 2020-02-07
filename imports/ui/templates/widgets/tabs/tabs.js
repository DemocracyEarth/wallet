import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import '/imports/ui/templates/widgets/tabs/tabs.html';

const _select = (tabItem) => {
  const instance = Template.instance();
  const state = instance.menuItem.get();
  const buffer = _.map(state, (item) => {
    const newItem = item; if (newItem.id === tabItem.id) { newItem.selected = true; } else { newItem.selected = false; } return newItem;
  });
  tabItem.action();
  instance.menuItem.set(buffer);
};

Template.tabs.onCreated(function () {
  Template.instance().menuItem = new ReactiveVar(Template.instance().data.item);
});

Template.tabs.helpers({
  menuItem() {
    return Template.instance().menuItem.get();
  },
  style() {
    const item = _.findWhere(Template.instance().menuItem.get(), { id: this.id });
    if (item.selected) { return 'tab-button-selected'; }
    return '';
  },
});

Template.tabs.events({
  'click #tab-button'() {
    _select(this);
  },
});
