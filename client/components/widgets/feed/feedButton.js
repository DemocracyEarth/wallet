Template.feedButton.rendered = function () {
  Session.set('feedToggle', false);
  console.log(this.id);
};

Template.feedButton.helpers({
  mouseDown: function () {
    return Session.get('feedToggle');
  }
})
Template.feedButton.events({
  'mousedown #button': function () {
    Session.set('feedToggle', true);
  },
  'mouseup #button': function () {
    Session.set('feedToggle', false);
  }
})
