import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import Search from '/imports/ui/templates/widgets/search/search.jsx';

import '/imports/ui/templates/widgets/search/search.html';

Template.search.helpers({
  Search() {
    return Search;
  },
  style() {
    if (Meteor.Device.isPhone()) {
      if (Meteor.user()) {
        return 'search-wrapper-logged search-wrapper-mobile';
      }
      return 'search-wrapper search-wrapper-mobile';
    }
    if (Meteor.user()) {
      return 'search-wrapper-logged';
    }
    return 'search-wrapper';
  },
});
