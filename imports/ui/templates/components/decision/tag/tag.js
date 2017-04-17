import { Template } from 'meteor/templating';
import Tag from './Tag.jsx';

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
  Tag() {
    return Tag;
  }
});
