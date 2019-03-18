import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Contracts } from '/imports/api/contracts/Contracts';

import '/imports/ui/templates/components/decision/ballot/ballot.js';
import '/imports/ui/templates/components/decision/poll/poll.html';

Template.poll.onCreated(function () {
  Template.instance().ready = new ReactiveVar(false);
  Template.instance().contracts = new ReactiveVar([]);

  const instance = this;
  const pollId = instance.data.pollId;

  instance.autorun(function (computation) {
    if (pollId) {
      const subscription = instance.subscribe('poll', { view: 'poll', pollId });

      if (subscription.ready()) {
        instance.ready.set(true);
        instance.contracts.set(Contracts.find({ pollId }).fetch());
        computation.stop();
      }
    }
  });
});

Template.poll.helpers({
  ready() {
    return Template.instance().ready.get();
  },
  item() {
    const contracts = Template.instance().contracts.get();
    const item = [];
    for (let i = 0; i < contracts.length; i += 1) {
      item.push({
        contract: contracts[i],
        totals: this.pollTotals,
        editor: this.editorMode,
      });
    }
    return item; // Template.instance().contracts.get();
  },
});
