Template.popup.rendered = function () {
  Session.set('displayPopup', false);
};

Template.popup.helpers({
  visible: function () {
    Modules.client.animatePopup(Session.get('displayPopup'));
  },
  content: function () {
    return Session.get('popupTemplate');
  },
  dataObject: function () {
    return Session.get('popupData');
  }
});

Template.popup.events({
  'mouseleave .popup': function (event) {
    if (Session.get('displayPopup')) {
      Session.set('displayPopup', false);
    }
  }
})
