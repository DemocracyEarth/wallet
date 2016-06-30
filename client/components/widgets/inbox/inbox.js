Template.inbox.helpers({
  drafts: function () {
    return Meteor.user().profile.menu.drafts;
  },
  memberships: function () {
    return Meteor.user().profile.menu.memberships;
  },
  delegations: function () {
    return Meteor.user().profile.menu.delegations;
  },
  votes: function () {
    return Meteor.user().profile.menu.votes;
  },
  signalStyle: function (score) {
    if (score > 0) {
      return '';
    } else {
      return 'void';
    }
  }
});

Template.inbox.rendered = function () {
  $('.menu-item').css('opacity', '0');
  $('.menu-item').velocity({'opacity': '1'}, Modules.client.animationSettings);
}
