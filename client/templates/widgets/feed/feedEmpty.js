Template.feedEmpty.helpers({
  proposalDrafting: function () {
    if (Meteor.settings.public.app.config.proposalDrafting == false) {
      return false;
    }
    return true;
  }
})
