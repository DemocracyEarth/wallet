Template.inbox.helpers({
  drafts: function () {
    if (Meteor.user() != undefined) {
      return Meteor.user().profile.menu.drafts;
    }
  },
  memberships: function () {
    if (Meteor.user() != undefined) {
      return Meteor.user().profile.menu.memberships;
    }
  },
  delegations: function () {
    if (Meteor.user() != undefined) {
      return Meteor.user().profile.menu.delegations;
    }
  },
  votes: function () {
    if (Meteor.user() != undefined) {
      return Meteor.user().profile.menu.votes;
    }
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
