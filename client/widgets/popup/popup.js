Template.popup.helpers({
  visible: function () {
    if (Session.get('displayLogin')) {
      return 'opacity: 1';
    } else {
      return 'opacity: 0';
    }
  }
})
