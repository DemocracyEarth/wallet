import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { Email } from 'meteor/email';
import { TAPi18n } from 'meteor/tap:i18n';
import { ServiceConfiguration } from 'meteor/service-configuration';

import { genesisTransaction } from '/imports/api/transactions/transaction';
import { loadExternalCryptoBalance } from '/imports/api/transactions/transaction';
import { Contracts } from '/imports/api/contracts/Contracts';
import { getTime } from '/imports/api/time';
import { logUser, log } from '/lib/const';
import { stripHTML, urlDoctor, fixDBUrl } from '/lib/utils';
import { notifierHTML } from '/imports/api/notifier/notifierTemplate.js';

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

/**
* @summary verifies if user has a verified email from a given domain
* @param {object} emailList obtained from profile
* @param {string} domain what domain to check for
* @return {boolean} if user has valid mail or not
*/
const _emailDomainCheck = (emailList, domain) => {
  let legit = false;
  if (emailList.length > 0) {
    for (const k in emailList) {
      if (emailList[k].verified) {
        const emailDomain = emailList[k].address.replace(/.*@/, '');
        if (emailDomain === domain) {
          legit = true;
          break;
        }
      }
    }
  }
  return legit;
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
    const from = `${Meteor.settings.public.Collective.name} <${Meteor.settings.public.Collective.emails[0].address}>`;
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
    html = html.replace('{{collective}}', `<a href='${Meteor.settings.public.Collective.profile.website}'>${Meteor.settings.public.Collective.name}</a>`);
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

    Email.send({ to, from, subject, text, html });
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
    const count = Meteor.users.find().count();
    log(`{ method: 'userCount', user: ${logUser()}, count: ${count} }`);
    return count;
  },

  /**
  * @summary returns whether user meets or not constituency criteria
  * @param {object} contract contract to evaluate
  * @return {boolean} if user can vote or not
  */
  verifyConstituency(contract) {
    check(contract, Object);

    log(`{ method: 'verifyConstituency', user: ${logUser()}, constituency: ${JSON.stringify(contract.constituency)} }`);

    if (!contract.constituency) {
      return true;
    }

    let legitimacy = true;

    if (Meteor.user()) {
      if (contract.constituency.length > 0) {
        for (const i in contract.constituency) {
          switch (contract.constituency[i].kind) {
            case 'TOKEN':
              if (Meteor.user().profile.wallet.currency !== contract.constituency[i].code) {
                legitimacy = false;
              }
              break;
            case 'NATION':
            default:
              if (Meteor.user().profile.country.code !== contract.constituency[i].code) {
                legitimacy = false;
              }
              break;
            case 'DOMAIN':
              if (Meteor.user().emails) {
                if (!_emailDomainCheck(Meteor.user().emails, contract.constituency[i].code)) {
                  legitimacy = false;
                }
              }
              if (Meteor.user().services.facebook) {
                if (!_emailDomainCheck([{ address: Meteor.user().services.facebook.email, verified: true }], contract.constituency[i].code)) {
                  legitimacy = false;
                }
              }
              break;
          }
        }
      } else {
        legitimacy = true;
      }
    } else {
      legitimacy = false;
    }

    return legitimacy;
  },
});
