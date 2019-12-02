import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

import { getVotes } from '/imports/api/transactions/transaction';
import { timeCompressed } from '/imports/ui/modules/chronos';
import { token } from '/lib/token';
import { Transactions } from '/imports/api/transactions/Transactions';
import { syncBlockchain } from '/imports/startup/both/modules/metamask';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { smallNumber, getCoin } from '/imports/api/blockchain/modules/web3Util';


import '/imports/ui/templates/widgets/transaction/transaction.html';
import '/imports/ui/templates/widgets/preview/preview.js';

const _verifySubsidy = (id) => {
  return (Meteor.settings.public.Collective._id === id);
};


/**
* @summary compose token html
* @param {object} currency i need to properly figure out this naming issue
* @return {string} html
*/
const _showToken = (currency) => {
  let code;
  if (!currency || currency === 'VOTES') {
    code = 'VOTE';
  }
  return `<div title="${_.where(token.coin, { code })[0].name}" class="suggest-item suggest-token suggest-token-inline" style="background-color: ${_.where(token.coin, { code })[0].color} ">${_.where(token.coin, { code })[0].code}</div>`;
};

/**
* @summary get the configuration for a balance component
* @param {object} transaction data from transaction component
* @return {object} balance template settings
*/
const _getContractToken = (transaction) => {
  let votes;
  const coin = {
    token: transaction.contract.wallet.currency,
    balance: 0,
    available: 0,
    placed: 0,
    isTransaction: true,
    isRevoke: (transaction.isRevoke && !_verifySubsidy(transaction.senderId)),
    date: transaction.contract.timestamp,
    disableBar: true,
    disableStake: true,
  };
  // crypto transactions
  if (transaction.contract.blockchain) {
    coin.blockchain = transaction.contract.blockchain;
    coin.contract = transaction.contract;
  }
  if (transaction.contract.kind === 'CRYPTO' && transaction.contract.blockchain) {
    coin.isCrypto = true;
    const coinData = getCoin(transaction.contract.blockchain.coin.code);
    if (coinData.nonFungible) {
      coin.value = transaction.contract.blockchain.tickets[0].value.toNumber();
    } else {
      coin.value = smallNumber(transaction.contract.blockchain.tickets[0].value, transaction.contract.blockchain.coin.code);
    }
  } else {
    if (transaction.isButton) {
      coin.isButton = transaction.isButton;
    }
    if (transaction.isVote) {
      votes = transaction.contract.wallet.balance;
      if (coin.isRevoke) {
        votes *= -1;
      }
      Template.instance().totalVotes.set(votes);
    } else if (transaction.contract.kind === 'DELEGATION') {
      let finalCount;
      if (transaction.isRevoke) {
        finalCount = parseInt(transaction.contract.wallet.balance * -1, 10);
      } else {
        finalCount = transaction.contract.wallet.balance;
      }
      Template.instance().totalVotes.set(finalCount);
      votes = Template.instance().totalVotes.get();
    }
    coin.balance = votes;
  }
  return coin;
};

Template.transaction.onCreated(function () {
  Template.instance().totalVotes = new ReactiveVar(0);
  Template.instance().loading = new ReactiveVar(false);
  Template.instance().alreadyConfirmed = false;
  Template.instance().txStatus = '';
  // const data = Template.currentData();
  // if (data.contract && data.contract.kind === 'CRYPTO' && data.contract.blockchain && data.contract.blockchain.tickets.length > 0) {
  //  Template.instance().status = new ReactiveVar(data.blockchain.tickets[0].status.toLowerCase());
  //}

  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

Template.transaction.onRendered(function () {
  syncBlockchain(this.data.contract);
});

Template.transaction.helpers({
  sender() {
    return {
      _id: this.senderId,
      imgStyle: () => {
        if (this.compressed) {
          return 'float: left; margin-top: 4px;';
        }
        return '';
      },
    };
  },
  receiver() {
    // const helper = this;
    return {
      _id: this.receiverId,
      imgStyle: () => {
        if (this.compressed) {
          return ' margin-top: 4px; margin-left: 5px; ';
        }
        return '';
      },
    };
  },
  isSubsidy() {
    return _verifySubsidy(this.senderId);
  },
  isVote() {
    return this.isVote;
  },
  value() {
    let votes;
    let plus = '';
    if (this.isVote) {
      votes = this.contract.wallet.balance;
      if (_verifySubsidy(this.senderId)) {
        plus = '+';
      } else if (this.isRevoke) {
        votes *= -1;
      }
      Template.instance().totalVotes.set(votes);
    } else if (this.editable) {
      if (Session.get(this.voteId)) {
        votes = Session.get(this.voteId).allocateQuantity;
        if (isNaN(votes)) { votes = Session.get(this.voteId).inBallot; }
        Template.instance().totalVotes.set(votes);
      }
    } else if (this.contract.kind === 'DELEGATION') {
      let finalCount;
      if (this.isRevoke) {
        finalCount = parseInt(this.contract.wallet.balance * -1, 10);
      } else {
        finalCount = this.contract.wallet.balance;
      }
      Template.instance().totalVotes.set(finalCount);
      votes = Template.instance().totalVotes.get();
    } else {
      Template.instance().totalVotes.set(getVotes(this.contract._id, this.senderId));
      votes = Template.instance().totalVotes.get();
    }
    if (votes !== 0) {
      return `${plus}${votes} ${_showToken(this.contract.wallet.currency)}`;
    }
    if (this.isVote) {
      return TAPi18n.__('choice-swap');
    }
    return TAPi18n.__('no-delegated-votes');
  },
  token() {
    return _getContractToken(this);
  },
  source() {
    return TAPi18n.__('delegated-votes');
  },
  voteStyle() {
    let style;
    if (Template.instance().totalVotes.get() !== 0) {
      if (_verifySubsidy(this.senderId)) {
        style = 'stage stage-vote-totals';
      } else if (this.isRevoke) {
        style = 'stage stage-finish-rejected';
      } else {
        style = 'stage stage-finish-approved';
      }
    } else {
      style = 'stage stage-live';
    }
    if (this.compressed) {
      style += ' stage-compressed';
    }
    return style;
  },
  ballotOption() {
    if (this.ballot && this.ballot.length > 0) {
      return TAPi18n.__(this.ballot[0].mode);
    }
    return '';
  },
  emptyVotes() {
    if (Template.instance().totalVotes.get() === 0 && !this.onCard && !this.isVote) {
      // return 'display:none';
    }
    return '';
  },
  sinceDate() {
    return `${timeCompressed(this.contract.timestamp, true)}`;
  },
  noDate() {
    return this.noDate;
  },
  stage() {
    if (this.ballot && this.ballot.length === 0) {
      return 'stage-single';
    }
    if (!this.winningBallot) {
      return 'stage-loosing';
    }
    return '';
  },
  onCard() {
    if (this.onCard) {
      return 'vote-delegation-card';
    }
    return '';
  },
  isCrypto() {
    return (this.contract.kind === 'CRYPTO');
  },
  isRevoke() {
    return this.isRevoke;
  },
  fromLedger() {
    return ((this.isVote || (this.contract.kind === 'DELEGATION')) && !this.editable);
  },
  hidePost() {
    return this.hidePost;
  },
  revokeStyle() {
    if (!this.hidePost) { return 'stage-revoke'; } return '';
  },
  blockchainHash() {
    if (this.contract.kind === 'CRYPTO' && this.contract.blockchain) {
      return `${Meteor.settings.public.web.sites.blockExplorer}/tx/${this.contract.blockchain.tickets[0].hash}`;
    }
    return '';
  },
  blockchainInfo() {
    const instance = Template.instance();
    if (this.contract.kind === 'CRYPTO' && this.contract.blockchain) {
      if (instance.txStatus === '') {
        const tx = Transactions.findOne({ _id: this.contract._id });
        if (tx) {
          const status = tx.blockchain.tickets[0].status.toLowerCase();
          if (status !== 'PENDING') {
            instance.txStatus = status;
          }
          return `${TAPi18n.__(`transaction-status-${status}-onchain`)} - ${this.contract.blockchain.tickets[0].hash}`;
        }
      } else {
        return `${TAPi18n.__(`transaction-status-${instance.txStatus}-onchain`)} - ${this.contract.blockchain.tickets[0].hash}`;
      }
    }
    return '';
  },
  transactionIcon() {
    const instance = Template.instance();
    if (this.contract.kind === 'CRYPTO' && this.contract.blockchain) {
      if (instance.txStatus === '') {
        const tx = Transactions.findOne({ _id: this.contract._id });
        if (tx) {
          const status = tx.blockchain.tickets[0].status.toLowerCase();
          if (status !== 'PENDING') {
            instance.txStatus = status;
          }
          return getImage(Template.instance().imageTemplate.get(), `arrow-right-${status}`);
        }
      } else {
        return getImage(Template.instance().imageTemplate.get(), `arrow-right-${instance.txStatus}`);
      }
    }
    return getImage(Template.instance().imageTemplate.get(), 'arrow-right');
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
});

Template.collectivePreview.helpers({
  flag() {
    return Meteor.settings.public.app.logo;
  },
  name() {
    let chars = 30;
    if (Meteor.Device.isPhone()) {
      chars = 15;
    }
    if (Meteor.settings.public.app.name.length > chars) {
      return `${Meteor.settings.public.app.name.substring(0, chars)}...`;
    }
    return Meteor.settings.public.app.name;
  },
  url() {
    return '/';
  },
});

export const getContractToken = _getContractToken;
