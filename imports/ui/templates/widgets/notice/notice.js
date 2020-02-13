import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';

import '/imports/ui/templates/widgets/notice/notice.html';

Template.notice.onRendered(() => {
  // behave(this.firstNode, 'fade');
  $('.context').css({ opacity: 0 });
  $('.context').velocity({ opacity: 1 });
});

Template.notice.helpers({
  label() {
    const notice = Session.get('noticeDisplay');
    if (notice.htmlMode) {
      return notice.label;
    }
    return TAPi18n.__(notice.label);
  },
});
