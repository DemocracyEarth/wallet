import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';
import { Meteor } from 'meteor/meteor';

import { query } from '/lib/views';
import { here } from '/lib/utils';
import { Transactions } from '/imports/api/transactions/Transactions';
import { displayNotice } from '/imports/ui/modules/notice';

import '/imports/ui/templates/widgets/tally/tally.html';

Template.tally.onCreated(function () {
  Template.instance().feed = new ReactiveVar();
  Template.instance().ready = new ReactiveVar(false);
  Template.instance().contractId = new ReactiveVar();

  console.log(Template.currentData().options);
  const instance = this;

  Meteor.call('getContractId', Template.currentData().options.keyword, function (error, result) {
    if (result) {
      console.log('called getContractId');
      console.log(result);
      console.log(instance);
      instance.contractId.set(result);
      // instance.ready.set(true);
    } else {
      console.log('id not found');
    }
  });


  if (instance.ready.get()) {
    console.log('instance ready');
    const parameters = query(Template.currentData().options);
    console.log(parameters);


    this.subscription = instance.subscribe('tally', Template.currentData().options);
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
        } else if (!here(post, currentFeed)) {
          currentFeed.push(post);
          instance.feed.set(_.uniq(currentFeed));
        }
      },
    });
  }
});

Template.tally.helpers({
  vote() {
    console.log(this);
    return Template.instance().feed.get();
  },
  ready() {
    const instance = Template.instance();
    const contractId = instance.contractId.get();
    console.log('ready');
    console.log(contractId);
    if (contractId) {
      console.log('instance ready');
      Template.currentData().options.contractId = contractId;
      const parameters = query(Template.currentData().options);
      console.log(parameters);


      this.subscription = instance.subscribe('tally', Template.currentData().options);
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
          } else if (!here(post, currentFeed)) {
            currentFeed.push(post);
            instance.feed.set(_.uniq(currentFeed));
          }
        },
      });
    }
  }

});
