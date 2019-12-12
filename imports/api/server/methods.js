import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { Email } from 'meteor/email';
import { TAPi18n } from 'meteor/tap:i18n';
import { ServiceConfiguration } from 'meteor/service-configuration';

import { genesisTransaction, loadExternalCryptoBalance, tallyBlockchainVotes } from '/imports/api/transactions/transaction';
import { Contracts } from '/imports/api/contracts/Contracts';
import { getTime } from '/imports/api/time';
import { logUser, log, defaults, gui } from '/lib/const';
import { stripHTML, urlDoctor, fixDBUrl } from '/lib/utils';
import { notifierHTML } from '/imports/api/notifier/notifierTemplate.js';
import { computeDAOStats } from '/lib/dao';
import { getLastTimestamp, getBlockHeight } from '/lib/web3';
import { Collectives } from '/imports/api/collectives/Collectives';

const _includeQuantity = (quantity, message) => {
  let modified;
  if (quantity === 0) {
    modified = message.replace('{{quantity}}', `${TAPi18n.__('email-modified-vote')}`);
  } else if (quantity === 1) {
    modified = message.replace('{{quantity}}', `${quantity} ${TAPi18n.__('vote').toLowerCase()}`);
  } else {
    modified = message.replace('{{quantity}}', `${quantity} ${TAPi18n.__('votes').toLowerCase()}`);
  }
  return modified;
};

Meteor.methods({
  /**
  * @summary sends email verififcation
  * @return {Object} email content
  */
  sendVerificationLink() {
    const userId = Meteor.userId();
    log(`{ method: 'sendVerificationLink', user: ${logUser()} }`);
    if (userId) {
      return Accounts.sendVerificationEmail(userId);
    }
    return false;
  },

  /**
  * @summary sends email
  * @param {string} toId userId receiving message
  * @param {string} fromId userId sending message
  * @param {string} story title of emails
  * @param {object} transaction votes transacted
  * @return {Object} email content
  */
  sendNotification(toId, fromId, story, transaction) {
    // Make sure that all arguments are strings.
    check([toId, fromId, story], [String]);
    check(transaction, Object);

    log(`{ method: 'sendEmail', user: ${logUser()}, story: '${story}' }`);

    let receiver;
    let subject;
    let text;
    let html = notifierHTML;
    const contract = Contracts.findOne({ _id: transaction.contractId });
    const sender = Meteor.users.findOne({ _id: fromId });

    subject = `${TAPi18n.__(`email-subject-${story.toLowerCase()}`)}`;
    html = html.replace('{{action}}', `${TAPi18n.__(`email-action-${story.toLowerCase()}`)}`);
    html = html.replace('{{message}}', `${TAPi18n.__(`email-html-${story.toLowerCase()}`)}`);
    text = `${TAPi18n.__(`email-text-${story.toLowerCase()}`)}`;
    receiver = Meteor.users.findOne({ _id: contract.signatures[0]._id });

    // define story
    switch (story) {
      case 'REPLY':
      case 'REVOKE':
      case 'SUBSIDY':
      case 'VOTE':
        html = html.replace('{{url}}', `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${fixDBUrl(contract.url)}`);
        break;
      case 'DELEGATION':
      case 'REVOKE-DELEGATE':
      default:
        if (story === 'DELEGATION' || story === 'REVOKE-DELEGATE') {
          receiver = Meteor.users.findOne({ _id: toId });
          html = html.replace('{{url}}', `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}peer/${sender.username}`);
        }
        break;
    }

    // compose message
    let emailAddress;
    if (receiver.emails && receiver.emails[0].address) {
      emailAddress = receiver.emails[0].address;
    } else if (receiver.services.facebook && receiver.services.facebook.email) {
      emailAddress = receiver.services.facebook.email;
    }

    const to = emailAddress;
    const from = `${Meteor.settings.public.app.name} <${Meteor.settings.public.Collective.emails[0].address}>`;
    subject = subject.replace('{{user}}', `@${sender.username}`);
    subject = subject.replace('{{title}}', `'${stripHTML(contract.title).substring(0, 30)}...'`);
    html = html.replace('{{user}}', `@${sender.username}`);
    html = html.replace('{{userURL}}', `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}peer/${sender.username}`);
    html = html.replace('{{title}}', `${contract.title}`);
    html = html.replace('{{titleBrief}}', `${contract.title.substring(0, 30)}...`);
    html = html.replace('{{postURL}}', `${urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${fixDBUrl(contract.url)}`);
    html = html.replace('{{reply}}', `${transaction.reply}`);
    html = html.replace('{{greeting}}', `${TAPi18n.__('email-greeting-hello')} @${receiver.username},`);
    html = html.replace('{{farewell}}', `${TAPi18n.__('email-farewell')}`);
    html = html.replace('{{collective}}', `<a href='${Meteor.settings.public.app.url}'>${Meteor.settings.public.app.name}</a>`);
    text = text.replace('{{user}}', `@${sender.username}`);
    text = text.replace('{{title}}', `${contract.title}`);

    if (transaction.input) {
      subject = _includeQuantity(transaction.input.quantity, subject);
      html = _includeQuantity(transaction.input.quantity, html);
      text = _includeQuantity(transaction.input.quantity, text);
    }

    // let other method calls from the same client start running, without
    // waiting for the email sending to complete.
    this.unblock();

    console.log(`{ server: 'sendNotification', from: '${sender.username}', to: '${receiver.username}', text: "${text}" }`);

    if (sender.username !== receiver.username) {
      Email.send({ to, from, subject, text, html });
    }
  },

  /**
  * @summary gives user subsidy with inital tokens
  */
  subsidizeUser(userId) {
    check(userId, String);

    log(`{ method: 'subsidizeUser', user: ${logUser()} }`);
    genesisTransaction(userId);
  },

  /**
  * @summary loads token balance associated with user's public address
  */
  loadUserTokenBalance(userId) {
    check(userId, String);

    log(`{ method: 'loadUserTokenBalance', user: ${logUser()} }`);
    loadExternalCryptoBalance(userId);
  },

  /**
  * @summary creates an user with username and email with no password
  */
  createEmailUser(_email) {
    check(_email, String);
    log(`{ method: 'createEmailUser', user: ${logUser()} }`);

    const _username = _email.slice(0, _email.indexOf('@'));
    const userId = Accounts.createUser({
      username: _username,
      email: _email,
    });
    Accounts.sendEnrollmentEmail(userId);
  },

  /**
  * @summary on every contract where theres a pending with the given hash, updates status
  * @param {string} hash to be updated
  * @param {string} status new condition
  */
  updateTransactionStatus(hash, status) {
    check(hash, String);
    check(status, String);

    const allContracts = Contracts.find({ 'blockchain.tickets': { $elemMatch: { hash } } }).fetch();
    let contract;

    for (let i = 0; i < allContracts.length; i += 1) {
      contract = allContracts[i];
      for (let j = 0; j < contract.blockchain.tickets.length; j += 1) {
        if (contract.blockchain.tickets[j].hash === hash) {
          contract.blockchain.tickets[j].status = status;
          break;
        }
      }
      Contracts.update({ _id: contract._id }, { $set: { 'blockchain.tickets': contract.blockchain.tickets }})
      tallyBlockchainVotes(contract._id);
    }

    log(`{ method: 'updateTransactionStatus', user: ${logUser()}, hash: '${hash}' }`);
  },

  /**
  * @summary updates API keys to prevent failure of having multiple nodes with a same db
  */
  updateAPIKeys() {
    log(`{ method: 'updateAPIKeys', user: ${logUser()} }`);

    ServiceConfiguration.configurations.update({
      service: 'facebook',
    }, {
      $set: {
        appId: Meteor.settings.private.API.facebook.appId,
        secret: Meteor.settings.private.API.facebook.appSecret,
      },
    });

    return true;
  },

  /**
  * @summary given a keyword returns contract id
  * @param {keyword} keyword identify contract by given keyword
  */
  getContract(keyword) {
    check(keyword, String);

    log(`{ method: 'getContract', user: ${logUser()}, keyword: '${keyword}' }`);
    return Contracts.findOne({ keyword });
  },

  /**
  * @summary given a keyword returns contract id
  * @param {keyword} keyword identify contract by given keyword
  */
  getContractById(contractId) {
    check(contractId, String);

    log(`{ method: 'getContractById', user: ${logUser()}, _id: '${contractId}' }`);
    return Contracts.findOne({ _id: contractId });
  },

  /**
  * @summary given a username returns user Id
  * @param {string} keyword identify contract by given keyword
  */
  getUser(username) {
    check(username, String);

    log(`{ method: 'getUser', user: ${logUser()}, keyword: '${username}' }`);
    const user = Meteor.users.findOne({ username });
    if (user) {
      return {
        _id: user._id,
        username: user.username,
        profile: user.profile,
      };
    }
    return {
      _id: '',
      username: '',
      profile: {},
    };
  },

  /**
  * @summary get the user object of the other delegate in the contract
  * @param {string} contractId delegate contract
  * @param {string} currentDelegateId already identified delegate
  */
  getOtherDelegate(contractId, currentDelegateId) {
    check(contractId, String);
    check(currentDelegateId, String);

    log(`{ method: 'getOtherDelegate', user: ${logUser()}, contractId: '${contractId}', currentDelegateId: '${currentDelegateId}' }`);
    const contract = Contracts.findOne({ _id: contractId });
    let user;

    for (const i in contract.signatures) {
      if (contract.signatures[i]._id !== currentDelegateId) {
        user = Meteor.users.findOne({ _id: contract.signatures[i]._id });
        break;
      }
    }

    if (user) {
      return {
        _id: user._id,
        username: user.username,
        profile: user.profile,
      };
    }

    return user;
  },

  /**
  * @summary returns the quantity of replies in a contract
  * @param {string} contractId contract to search replies for
  */
  countReplies(contractId) {
    check(contractId, String);

    log(`{ method: 'countReplies', user: ${logUser()}, contractId: '${contractId}' }`);
    return Contracts.find({ replyId: contractId }).count();
  },

  /**
  * @summary reports server time from server to client
  * @return {Date} time
  */
  getServerTime() {
    // log(`{ method: 'getServerTime', user: ${logUser()} }`);
    return getTime();
  },

  /**
  * @summary counts the total items on a collection.
  * @return {Number} total count.
  */
  feedCount(query, options) {
    check(query, Object);
    check(options, Object);
    const count = Contracts.find(query, options).count();
    log(`{ method: 'feedCount', user: ${logUser()}, count: ${count} }`);
    return count;
  },

  /**
  * @summary counts the total users on the collective
  * @return {Number} total count.
  */
  userCount() {
    const count = Meteor.users.find({ 'profile.membership': 'MEMBER' }).count();
    log(`{ method: 'userCount', user: ${logUser()}, count: ${count} }`);
    return count;
  },

  /**
  * @summary updates the period of the posts
  * @param {Date} lastTimestamp with last sync signature
  * @return {Number} total count.
  */
  sync(lastTimestamp) {
    check(lastTimestamp, Date);
    const feed = Contracts.find({ $or: [{ period: 'VOTING' }, { period: 'GRACE' }, { period: 'QUEUE' }, { period: 'PROCESS' }] }).fetch();

    log(`{ method: 'sync', feed.length: '${feed.length}' }`);

    let newPeriod;
    let queueEnd;
    for (let i = 0; i < feed.length; i += 1) {
      newPeriod = feed[i].period;
      switch (feed[i].period) {
        case 'PROCESS':
          if (lastTimestamp > feed[i].closing.graceCalendar && feed[i].processed) {
            if (!feed[i].aborted) {
              newPeriod = 'COMPLETE';
            }
            if (feed[i].didPass) {
              newPeriod = 'PASSED';
            } else if (feed[i].aborted) {
              newPeriod = 'ABORTED';
            }
          }
          break;
        case 'GRACE':
          if ((lastTimestamp > feed[i].closing.graceCalendar) && !feed[i].processed) {
            newPeriod = 'PROCESS';
          }
          break;
        case 'VOTING':
          if (lastTimestamp > feed[i].closing.calendar) {
            newPeriod = 'GRACE';
          }
          break;
        case 'QUEUE':
        default:
          queueEnd = parseInt(feed[i].timestamp.getTime() + feed[i].closing.periodDuration, 10);
          if (lastTimestamp > queueEnd) {
            newPeriod = 'VOTING';
          }
          break;
      }
      if (newPeriod !== feed[i].period) {
        Contracts.update({ _id: feed[i]._id }, { $set: { period: newPeriod } });
      }
    }
    computeDAOStats();
  },

  async getBlock(collectives) {
    check(collectives, Array);

    log(`{ method: 'getBlock', collectiveId: ${JSON.stringify(collectives)} }`);

    const lastTimestamp = await getLastTimestamp().then((resolved) => { return resolved; });
    const blockTimes = [];
    blockTimes.push({
      collectiveId: defaults.ROOT,
      height: await getBlockHeight().then((resolved) => { return resolved; }),
      timestamp: lastTimestamp,
    });

    let collectiveList;
    if (collectives.length === 0) {
      const recentCollectives = Collectives.find({}, { limit: gui.COLLECTIVE_MAX_FETCH }).fetch();
      collectiveList = _.pluck(recentCollectives, '_id');
    } else {
      collectiveList = collectives;
    }

    let now;
    for (let j = 0; j < collectiveList.length; j += 1) {
      const collective = Collectives.findOne({ _id: collectiveList[j] });
      if (collective) {
        const smartContracts = collective.profile.blockchain.smartContracts;
        const summoningTime = parseFloat(collective.profile.summoningTime.getTime(), 10);
        let periodDuration;
        let found = false;
        for (let i = 0; i < smartContracts.length; i += 1) {
          for (let k = 0; k < smartContracts[i].parameter.length; k += 1) {
            if (smartContracts[i].parameter[k].name === 'periodDuration') {
              periodDuration = smartContracts[i].parameter[k].value.toNumber();
              found = true;
              break;
            }
          }
          if (found) { break; }
        }
        now = {
          collectiveId: collectiveList[j],
          height: parseFloat(((lastTimestamp - summoningTime) / periodDuration) / 1000, 10),
          timestamp: lastTimestamp,
        };
      } else {
        now = {
          collectiveId: collectiveList[j],
          height: undefined,
          timestamp: lastTimestamp,
        };
      }

      if (now) {
        blockTimes.push(now);
      }
    }

    const finalBlockTimes = _.uniq(blockTimes);

    return finalBlockTimes;
  },

});
