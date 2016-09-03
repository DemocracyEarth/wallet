Template.popup.rendered = function () {
  Session.set('displayPopup', false);
};

Template.popup.helpers({
  visible: function () {
    Modules.client.animatePopup(Session.get('displayPopup'));
  }
});

Template.popup.events({
  'mouseleave .popup': function (event) {
    Session.set('displayPopup', false);
  }
})
