if (Meteor.isClient) {
  Template.navigation.helpers({
    screen: function () {
      switch(Session.get('stage')) {
        case 'draft':
          return TAPi18n.__('screen-new-proposal') + " <strong>" + ORGANIZATION_NAME + "</strong>";
        default:
          return ORGANIZATION_NAME;
      }
    },
    icon: function () {
      return 'images/olive-spaced.png';
    }
  })
}
