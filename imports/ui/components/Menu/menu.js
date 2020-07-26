import { Template } from 'meteor/templating';

import Menu from '/imports/ui/components/Menu/Menu.jsx';

import '/imports/ui/components/Menu/menu.html';

Template.menu.helpers({
  Menu() {
    return Menu;
  },
});

