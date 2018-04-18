import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';

import { stripHTMLfromText } from '/imports/ui/modules/utils';
import { query } from '/lib/views';
import { here } from '/lib/utils';
import { Transactions } from '/imports/api/transactions/Transactions';
import { Contracts } from '/imports/api/contracts/Contracts';

import '/imports/ui/templates/widgets/preview/preview.html';


Template.preview.onCreated(function () {
  Template.instance().feed = new ReactiveVar();
  Template.instance().contract = new ReactiveVar();

  const instance = this;
  const _id = Template.currentData().contractId;
  if (_id) {
    const contract = Contracts.findOne({ _id });
    if (!contract) {
      Meteor.call('getContractById', Template.currentData().contractId, function (error, result) {
        if (result) {
          console.log(result);
          instance.contract.set(result);
        } else if (error) {
          console.log(error);
        }
      });
    } else {
      instance.contract.set(contract);
    }
  }
});

Template.preview.helpers({
  displayTitle() {
    const contract = Template.instance().contract.get();
    let chars = 30;
    if (Meteor.Device.isPhone()) {
      chars = 15;
    }
    return `${stripHTMLfromText(contract.title).substring(0, chars)}...`;
  },
  fullTitle() {
    return stripHTMLfromText(Template.instance().contract.get().title);
  },
  url() {
    return Template.instance().contract.get().url;
  },
});
