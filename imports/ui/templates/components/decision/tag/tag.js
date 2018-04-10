import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { addTag } from '/lib/data';

import './tag.html';

Template.tag.helpers({
  authorization(hover) {
    return 'authorized';
  },
  drag(){
    if (this.nonDraggable) {
      return 'tag-no-grab';
    }
  },
});

Template.tag.events({
  'click .add-suggested-tag'(event) {
    addTag(this._id, parseInt(Session.get('dbTagList').length) + 1);
  },
});
