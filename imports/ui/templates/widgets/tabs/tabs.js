import { Template } from 'meteor/templating';

import '/imports/ui/templates/widgets/tabs/tabs.html';

Template.tabs.helpers({
  style() {
    if (this.selected) { return 'tab-button-selected'; }
    return '';
  },
});
