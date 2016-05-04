Template.notice.rendered = function () {
  behave(this.firstNode, 'fade');
};

Template.notice.helpers({
  label: function () {
    return TAPi18n.__(Session.get('noticeDisplay'));
  }
});

displayNotice = function (label, temporary) {
  Session.set('noticeDisplay', label);
  Session.set('showNotice', true);

  if (temporary) {
    Meteor.setTimeout(function() {
       Session.set('showNotice', false);
    }, WARNING_DURATION);
  }

}
