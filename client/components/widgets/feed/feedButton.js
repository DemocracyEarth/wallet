Template.feedButton.rendered = function () {
  //feedButtonId.push(this.firstNode.id);
  //Session.set('feedToggle' + feedButtonId, false);
};

Template.feedButton.helpers({
  display: function () {

    //return Session.get('feedToggle' + feedButtonId);
  }
})
Template.feedButton.events({
  'mousedown .feedButton': function (event) {
    var buttonId = 'button-' + event.target.id;
    document.getElementById(buttonId).style.opacity = 0;
  },
  'mouseup .feedButton': function (event) {
    var buttonId = 'button-' + event.target.id;
    document.getElementById(buttonId).style.opacity = 1;
  }
})
