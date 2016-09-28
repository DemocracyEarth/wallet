Template.tag.helpers({
  authorization: function (hover) {
    return 'authorized';
  },
  drag: function () {
    if (this.nonDraggable) {
      return 'tag-no-grab';
    }
  }
});

Template.tag.events({
  "click #add-suggested-tag": function (event) {
    addTag(this._id, parseInt(Session.get('dbTagList').length) + 1);
  }
});
