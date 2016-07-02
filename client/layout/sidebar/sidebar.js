Template.sidebar.helpers({
  menu: function () {
    var stateMenu = new Array();

    if (Meteor.user() != undefined) {
      stateMenu.push(
        {
          label: TAPi18n.__('all'),
          value: Meteor.user().profile.menu.votes,
          url: '',
          selected: true
        },
        {
          label: TAPi18n.__('memberships'),
          value: Meteor.user().profile.menu.memberships,
          url: '',
          selected: false
        },
        {
          label: TAPi18n.__('delegations'),
          value: Meteor.user().profile.menu.delegations,
          url: '',
          selected: false
        },
        {
          label: TAPi18n.__('drafts'),
          value: Meteor.user().profile.menu.drafts,
          url: '',
          selected: false
        });
      }

    return stateMenu;
  }
})
