if (Meteor.isClient) {

  Template.tag.rendered = function () {
    behave(this.firstNode, 'fade');
  };

  Template.tag.helpers({
    authorization: function (hover) {
      return 'authorized';
    }
  });

  Template.tag.events({
    "click #add-suggested-tag": function (event) {
      addTag(this._id, parseInt(Session.get('dbTagList').length) + 1);
    }
  });

}
