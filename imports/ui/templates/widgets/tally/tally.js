import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';

import { query } from '/lib/views';
import { Transactions } from '/imports/api/transactions/Transactions';
import { displayNotice } from '/imports/ui/modules/notice';

import '/imports/ui/templates/widgets/tally/tally.html';

Template.tally.onCreated(function () {
  Template.instance().feed = new ReactiveVar();

  console.log(Template.currentData().options);

  const instance = this;
  const parameters = query(Template.currentData().options);
  this.subscription = instance.subscribe('feed', Template.currentData().options);
  const dbQuery = Transactions.find(parameters.find, parameters.options);

  this.handle = dbQuery.observeChanges({
    changed: () => {
      displayNotice(TAPi18n.__('notify-new-posts'), true);
    },
    addedBefore: (id, fields) => {
      console.log('data received');
      // added stuff
      const currentFeed = instance.feed.get();
      const post = fields;
      post._id = id;
      if (!currentFeed) {
        instance.feed.set([post]);
      } else if (!_here(post, currentFeed)) {
        currentFeed.push(post);
        instance.feed.set(_.uniq(currentFeed));
      }
    },
  });
});

Template.feed.helpers({
  vote() {
    console.log(this);
    return Template.instance().feed.get();
  },
});
