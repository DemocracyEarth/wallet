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
import { getLastTimestamp, getBlockHeight, getShares, setTransaction, getEvents } from '/lib/web3';
import { getTransactionObject } from '/lib/interpreter';
import { query } from '/lib/views';
import { Collectives } from '/imports/api/collectives/Collectives';

/**
* @summary include a quantity in a message
* @param {string} quantity to include
* @param {string} message to parse
* @return {number} with total proposals
*/
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
* @summary quick count of all proposals in the system
* @return {number} with total proposals
*/
const _getHistoryCount = () => {
  const collectives = Collectives.find().fetch();
  let finalCount = 0;
  for (const dao of collectives) {
    if (dao.profile && dao.profile.menu) {
      for (const item of dao.profile.menu) {
        if ((item.label === 'moloch-all') && item.count) {
          finalCount += item.count;
          break;
        }
      }
    }
  }
  return finalCount;
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
  getProposalContract(contractId) {
    check(contractId, String);
    log(`{ method: 'getProposalContract', user: ${logUser()}, _id: '${contractId}' }`);
    const contract = Contracts.findOne({ _id: contractId });
    if (contract.pollId) {
      return Contracts.findOne({ _id: contract.pollId });
    }
    return contract;
  },

  /**
 * @summary given a keyword returns contract id
 * @param {keyword} keyword identify contract by given keyword
 */
  getContractById(contractId) {
    check(contractId, String);
    log(`{ method: 'getProposalContract', user: ${logUser()}, _id: '${contractId}' }`);
    return Contracts.findOne({ _id: contractId });
  },

  /**
  * @summary given a keyword returns contract id
  * @param {keyword} keyword identify contract by given keyword
  */
  getCollectiveById(collectiveId) {
    check(collectiveId, String);
    log(`{ method: 'getCollectiveById', user: ${logUser()}, _id: '${collectiveId}' }`);
    return Collectives.findOne({ _id: collectiveId });
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
  * @summary adds one to the social shares counter
  * @param {string} contractId contract to update
  */
  addShareCounter(contractId) {
    check(contractId, String);
    log(`{ method: 'plusSocialSharing', user: ${logUser()}, contractId: '${contractId}' }`);
    const contract = Contracts.findOne({ _id: contractId });
    const counter = (contract.shareCounter) ? contract.shareCounter : 0;
    Contracts.update({ _id: contractId }, { $set: { shareCounter: parseInt(counter + 1, 10) } });
    return counter;
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
  feedCount(feedQuery, options) {
    check(feedQuery, Object);
    check(options, Object);
    const count = Contracts.find(feedQuery, options).count();
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
  * @summary get block timme
  * @param {object} collective where to persist blocktime
  */
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
      if ((collective && !collective.status) || (collective && collective.status && collective.status.blockchainSync === 'UPDATED')) {
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

  /**
  * @summary get a user or collective based on a public address with its corresponding replica score
  * @param {string} publicAddress to calculate replica on
  */
  getReplica(publicAddress) {
    check(publicAddress, String);
    log(`{ method: 'getReplica', publicAddress: '${publicAddress}' }`);
    const replica = {};
    const user = Meteor.users.findOne({ username: publicAddress.toLowerCase() });
    if (user) {
      replica.user = Meteor.users.findOne({ username: publicAddress.toLowerCase() });
    }
    return replica;
  },

  /**
  * @summary get a user or collective based on a public address with its corresponding replica score
  * @param {string} publicAddress to calculate replica on
  */
  getMenu(daoName) {
    check(daoName, String);
    log(`{ method: 'getMenu', daoName: '${daoName}' }`);

    let collectives;
    let daoSpecific = false;
    if (!daoName) {
      collectives = Collectives.find().fetch();
    } else {
      const parameters = query({ view: 'addressDao', publicAddress: daoName });
      collectives = Collectives.find(parameters.find).fetch();

      let fullyLoaded;
      for (const listed of collectives) {
        if ((listed.status && listed.status.blockchainSync === 'UPDATED') || !listed.status) {
          fullyLoaded = true;
          break;
        }
      }
      if ((collectives.length > 0) && fullyLoaded) {
        daoSpecific = true;
      } else {
        collectives = Collectives.find().fetch();
      }
    }

    const finalMenu = [];
    let found = false;
    for (const dao of collectives) {
      if (dao.profile && dao.profile.menu) {
        for (const item of dao.profile.menu) {
          found = false;
          if (finalMenu.length > 0) {
            for (const finalItem of finalMenu) {
              if (finalItem.label === item.label) {
                item.count = parseInt(finalItem.count + item.count, 10);
                found = true;
                break;
              }
            }
          }
          if (!found) {
            if (daoSpecific && item.url) {
              item.url = `/dao/${daoName.toLowerCase()}${(item.url === '/') ? '' : item.url}`;
            }
            if (daoSpecific && item.separator) {
              item.label = TAPi18n.__(`${item.label}-dao-specific`).replace('{{dao}}', dao.name);
            }
            finalMenu.push(item);
          } else {
            for (let i = 0; i < finalMenu.length; i += 1) {
              if (finalMenu[i].label === item.label) {
                finalMenu[i].count = item.count;
                finalMenu[i].url = item.url;
              }
            }
          }
        }
      }
    }

    const allDAOs = {
      label: 'all-daos',
      icon: 'images/globe.svg',
      iconActivated: 'images/globe-active.svg',
      feed: 'user',
      value: true,
      separator: false,
      url: '/',
      displayToken: false,
      displayCount: true,
      count: _getHistoryCount(),
    };

    // insert back to general view
    if (daoSpecific) {
      finalMenu.unshift(allDAOs);
    }

    return finalMenu;
  },

  async setPendingVote(contract, userId, collectiveId, hash, uintVote) {
    check(contract, Object);
    check(userId, String);
    check(collectiveId, String);
    check(hash, String);
    check(uintVote, Number);
    log(`{ method: 'setPendingVote', userId: '${userId}', collectiveId: '${collectiveId}' }`);

    const voter = Meteor.users.findOne({ _id: userId });
    const shares = getShares(voter, collectiveId);

    let poll;
    switch (uintVote) {
      case defaults.YES: // yes
        poll = Contracts.findOne({ keyword: `${contract.keyword}/yes` });
        break;
      case defaults.NO: // no
        poll = Contracts.findOne({ keyword: `${contract.keyword}/no` });
        break;
      default:
    }

    const userHash = _.findWhere(voter.profile.wallet.address, { chain: defaults.BLOCKCHAIN }).hash;

    const ticket = {
      shares,
      timestamp: await getLastTimestamp(),
      contract: {
        _id: contract._id,
      },
      poll: {
        _id: poll._id,
      },
      address: contract.keyword,
      collectiveId: contract.collectiveId,
      blockchain: {
        tickets: [
          {
            hash,
            status: 'PENDING',
            value: shares.toNumber(),
          },
        ],
        coin: {
          code: defaults.TOKEN,
        },
        publicAddress: userHash.toLowerCase(),
        score: {
          totalConfirmed: shares.toString(),
          totalPending: '0',
          totalFail: '0',
          finalConfirmed: shares.toNumber(),
          finalPending: 0,
          finalFail: 0,
          value: 0,
        },
      },
    };
    const transactionObject = getTransactionObject(voter, ticket);
    transactionObject.status = 'PENDING';
    const pollId = poll._id;
    const txId = setTransaction(userId, pollId, transactionObject);

    // update dao
    const dao = Collectives.findOne({ _id: collectiveId });
    log(`[dao] Checking status of ${dao.name}...`);
    if ((dao.status.blockchainSync === 'UPDATED' && dao.profile.lastSyncedBlock)) {
      log(`[dao] Processing DAO: ${dao.name}...`);
      const syncFrom = (dao.profile.lastSyncedBlock) ? (dao.profile.lastSyncedBlock + 1) : defaults.START_BLOCK;
      for (const smartContract of dao.profile.blockchain.smartContracts) {
        log(`[dao] Processing smart contracts: ${smartContract.label}, syncing from ${syncFrom} to block: latest`);
        await getEvents(smartContract, dao._id, syncFrom, 'latest');
      }
    } else {
      log(`[dao] DAO ${dao.name} is not available for processing.`);
    }

    return txId;
  },

});
