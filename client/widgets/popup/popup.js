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
    if (Session.get('displayPopup')) {
      Session.set('displayPopup', false);
    }
  }
})
