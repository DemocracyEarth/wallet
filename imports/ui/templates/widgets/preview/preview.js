import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';

import { stripHTMLfromText } from '/imports/ui/modules/utils';
import { Contracts } from '/imports/api/contracts/Contracts';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { getProposalDescription } from '/imports/ui/templates/widgets/feed/feedItem';

import '/imports/ui/templates/widgets/preview/preview.html';

const _getCharLength = (id) => {
  const DEFAULT = 30;
  const width = $(`#transactionItem-${id}`).width;
  if (width) {
    const chars = parseInt((width * DEFAULT) / 600, 10);
    console.log(chars);
    return chars;
  }
  return DEFAULT;
};

Template.preview.onCreated(function () {
  Template.instance().feed = new ReactiveVar();
  Template.instance().contract = new ReactiveVar();
  Template.instance().proposal = new ReactiveVar();

  const instance = this;
  const _id = Template.currentData().contractId;
  if (_id) {
    const contract = Contracts.findOne({ _id });
    if (contract && contract.pollId) {
      instance.contract.set(contract);
      Meteor.call('getProposalContract', Template.currentData().contractId, function (error, result) {
        if (result) {
          instance.proposal.set(result);
        } else if (error) {
          console.log(error);
        }
      });
    } else if (!contract) {
      Meteor.call('getContractById', Template.currentData().contractId, function (error, result) {
        if (result) {
          instance.contract.set(result);

          if (result.pollId) {
            Meteor.call('getProposalContract', result._id, function (err, res) {
              if (res) {
                instance.proposal.set(res);
              } else if (err) {
                console.log(err);
              }
            });
          }
        } else if (error) {
          console.log(error);
        }
      });
    }
  }

  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

Template.preview.helpers({
  ready() {
    return (Template.instance().contract.get() !== undefined);
  },
  ragequit() {
    return this.ragequit;
  },
  passed() {
    const thumbUp = (Template.instance().contract.get().importId.toUpperCase().match('YES'));
    return (thumbUp && thumbUp.length > 0);
  },
  displayTitle() {
    const contract = Template.instance().contract.get();
    const title = stripHTMLfromText(contract.title);
    let chars = 21; // _getCharLength(contract._id);
    if (Meteor.Device.isPhone()) {
      chars = 15;
    }
    if (title.length > chars) {
      return `${title.substring(0, chars)}&mldr;`;
    }
    return title;
  },
  fullTitle() {
    const proposal = Template.instance().proposal.get();
    if (proposal && proposal.title) {
      return `${getProposalDescription(proposal.title, true).substring(0, 45)}...`;
    }
    return stripHTMLfromText(Template.instance().contract.get().title);
  },
  url() {
    return Template.instance().contract.get().url;
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
});
