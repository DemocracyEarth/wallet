if (Meteor.isClient) {

  Template.notice.helpers({
    notify: function () {
      switch(Session.get('noticeDisplay')) {
        case 'saved-draft-description':
          displayTimedWarning('noticeDisplay', '');
          return '';
        default:
          return 'display:none';
      }
    },
    label: function () {
      return TAPi18n.__(Session.get('noticeDisplay'));
    }
  });

}
