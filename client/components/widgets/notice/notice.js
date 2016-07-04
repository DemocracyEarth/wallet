Template.notice.rendered = function () {
  behave(this.firstNode, 'fade');
};

Template.notice.helpers({
  label: function () {
    return TAPi18n.__(Session.get('noticeDisplay'));
  }
});
