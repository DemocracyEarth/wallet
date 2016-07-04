let showNotice = (label, temporary) => {
  Session.set('noticeDisplay', label);
  Session.set('showNotice', true);

  if (temporary) {
    Meteor.setTimeout(function() {
       Session.set('showNotice', false);
    }, WARNING_DURATION);
  }

}

Modules.client.displayNotice = showNotice;
