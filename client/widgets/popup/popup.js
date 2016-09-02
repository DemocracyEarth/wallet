Template.popup.rendered = function () {
  Session.set('displayPopup', false);
};

Template.popup.helpers({
  visible: function () {
    if (Session.get('displayPopup')) {
      return 'opacity: 1;';
    } else {
      return 'opacity: 0; margin-top:-10000px;';
    }
  }
})
