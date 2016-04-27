if (Meteor.isClient) {

  Template.vote.helpers({
    showNotice: function () {
      return Session.get('showNotice');
    }
  });

}
