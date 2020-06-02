import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';
import { TAPi18n } from 'meteor/tap:i18n';

import { getEvents, sync, getBlockHeight, getLastTimestamp, hasDAO, getState } from '/lib/web3';
import { log, defaults } from '/lib/const';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Tokens } from '/imports/api/tokens/tokens';
import { oracles } from '/imports/startup/both/modules/oracles';
import { DAOTemplates } from '/lib/templates';

import { CronJob } from 'cron';

const _insertToken = (token) => {
  Tokens.insert(token, (error, result) => {
    if (error) {
      log('[dao WARNING] Insert Error.');
      log(error);
    }
    if (result) {
      log('[dao] Successfully inserted');
    }
  });
};


/**
* @summary tokens must be persisted in the db for the long run
*/
const _setupTokens = async () => {
  const tokenJSON = 'lib/token.json';
  log('[dao] Setting up tokens..');

  const token = JSON.parse(Assets.getText(tokenJSON)).coin; // eslint-disable-line no-undef
  log(`[dao] Found a total of ${token.length} tokens in JSON settings`);

  if (!token) {
    log('[dao WARNING] No Token settings found.');
    log("[dao FIX] Add 'lib/token.json' with list of tokens to be supported following a Schema.Token object inside a 'coin' Array.");
    return undefined;
  }

  let coin = [];
  for (let i = 0; i < token.length; i += 1) {
    log(`[dao] Inserting token ${token[i].code}...`);
    coin = Tokens.find({ code: token[i].code }).fetch();

    if (coin.length === 0) {
      _insertToken(token[i]);
    } else {
      log('[dao] Token already found in db.');
    }
    coin = [];
  }
  return Tokens.find().fetch();
};

/**
* @summary persists the latest stats of a DAO
*/
const _compute = () => {
  const collectives = Collectives.find({ 'status.blockchainSync': 'UPDATED' }).fetch();
  const QUERY_KEYWORD = '/?period=';
  let dataKeyworkd;
  let url;
  let count = 0;
  for (let i = 0; i < collectives.length; i += 1) {
    log(`[dao] Computing statistics for ${collectives[i].name}...`);
    if (collectives[i].profile && collectives[i].profile.menu) {
      for (let k = 0; k < collectives[i].profile.menu.length; k += 1) {
        if (collectives[i].profile.menu[k].url) {
          url = collectives[i].profile.menu[k].url;
          if (collectives[i].profile.menu[k].url.match(QUERY_KEYWORD)) {
            dataKeyworkd = url.replace(QUERY_KEYWORD, '').toUpperCase();
            count = Contracts.find({ period: dataKeyworkd, collectiveId: collectives[i]._id }).count();
          } else if (collectives[i].profile.menu[k].url === '/') {
            count = Contracts.find({ collectiveId: collectives[i]._id, pollId: { $exists: false } }).count();
          }
          if (collectives[i].profile.menu[k].count !== count) {
            collectives[i].profile.menu[k].count = count;
            Collectives.update({ _id: collectives[i]._id }, { $set: { 'profile.menu': collectives[i].profile.menu } });
          }
        }
      }
    }
  }
};

/**
* @summary updates the period of the posts
* @return {Number} total count.
*/
const _update = async () => {
  const feed = Contracts.find({ $or: [{ period: 'COMPLETE' }, { period: 'VOTING' }, { period: 'GRACE' }, { period: 'QUEUE' }, { period: 'PROCESS' }] }).fetch();

  const lastTimestamp = await getLastTimestamp();
  log(`[dao] Updating period for ${feed.length} proposals with timestamp ${lastTimestamp}...`);

  let newPeriod;
  let queueEnd;
  for (let i = 0; i < feed.length; i += 1) {
    newPeriod = feed[i].period;
    switch (feed[i].period) {
      case 'PROCESS':
      case 'COMPLETE':
        if (lastTimestamp >= feed[i].closing.graceCalendar && feed[i].processed) {
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
        if (lastTimestamp > feed[i].closing.calendar && !feed[i].processed) {
          newPeriod = 'GRACE';
        }
        break;
      case 'QUEUE':
      default:
        queueEnd = parseInt(feed[i].timestamp.getTime() + feed[i].closing.periodDuration, 10);
        if (lastTimestamp > queueEnd && !feed[i].processed) {
          newPeriod = 'VOTING';
        }
        break;
    }
    if (newPeriod !== feed[i].period) {
      Contracts.update({ _id: feed[i]._id }, { $set: { period: newPeriod } });
    }
  }
};

/**
* @summary install a DAO from a given address
* @param {string} publicAddress of the DAO to parse
* @param {object} settings settings to include in the insert
*/
const _install = async (publicAddress, settings) => {
  // inserts new DAO to be scanned by cronjob
  const temporary = {
    name: publicAddress,
    status: {
      loadPercentage: 0,
      blockchainSync: 'SETUP',
      publicAddress,
      message: TAPi18n.__('synchronizer-detail'),
    },
  };

  let finalSettings;
  if (settings) {
    finalSettings = Object.assign(temporary, settings);
  } else {
    finalSettings = temporary;
  }

  Collectives.insert(finalSettings, (error, result) => {
    if (error) {
      log('[dao WARNING] Insert Error.');
      log(error);
    }
    if (result) {
      log(`[dao] Temporary collective inserted with id: ${result}`);
    }
    return result;
  });
};


/**
* @summary inserts all daos listed on json to database
*/
const _insert = async () => {
  const daoJSON = 'lib/dao.json';
  log('[dao] Setting up Distributed Autonomous Organizations..');

  const presetDAOs = JSON.parse(Assets.getText(daoJSON)).dao; // eslint-disable-line no-undef
  log(`[dao] Found a total of ${presetDAOs.length} DAOs in JSON settings`);

  if (!presetDAOs) {
    log('[dao WARNING] No DAO settings found.');
    log("[dao FIX] Add 'lib/dao.json' with list of DAOs to be supported using a Schema.Blockchain object inside a 'dao' Array.");
    return undefined;
  }

  let collective = [];
  for (const dao of presetDAOs) {
    log(`[dao] Adding DAO: ${dao.name}...`);
    collective = Collectives.find({ $or: [{ name: dao.name }, { 'profile.blockchain.publicAddress': dao.profile.blockchain.publicAddress }] }).fetch();

    if (collective.length === 0) {
      _install(dao.profile.blockchain.publicAddress, dao);
    } else {
      log('[dao] DAO already found in db.');
    }
    collective = [];
  }

  return true;
};

/**
* @summary processes the events of a DAO
* @param {object} state if it has already been processed elsewhere
* @param {string} syncCollectiveId special case for a DAO synced for first time
*/
const _process = async (state, syncCollectiveId) => {
  // update DAO events
  const currentBlock = await getBlockHeight();
  const collectives = Collectives.find({ $or: [{ 'status.blockchainSync': 'UPDATED' }, { 'status.blockchainSync': 'SYNCING' }] }).fetch();
  for (const dao of collectives) {
    log(`[dao] Checking status of ${dao.name}...`);

    if ((dao.status.blockchainSync === 'UPDATED' && dao.profile.lastSyncedBlock) || (dao.status.blockchainSync === 'SYNCING' && dao._id === syncCollectiveId)) {
      log(`[dao] Processing DAO: ${dao.name}...`);
      const syncFrom = (dao.profile.lastSyncedBlock) ? (dao.profile.lastSyncedBlock + 1) : defaults.START_BLOCK;

      for (const smartContract of dao.profile.blockchain.smartContracts) {
        log(`[dao] Processing smart contracts: ${smartContract.label}, syncing from ${syncFrom} to block: ${currentBlock}`);
        await getEvents(smartContract, dao._id, syncFrom, currentBlock, state);
      }
    } else {
      log(`[dao] DAO ${dao.name} is not available for processing.`);
    }
  }
};

/**
* @summary given a public address, it scans the activity behind it
*/
const _scan = async () => {
  const collectives = Collectives.find({ 'status.blockchainSync': 'SETUP' }).fetch();
  log(`[dao] Scanning ${collectives.length} new addresses....`);

  let status;
  let editedTemplate;
  for (const dao of collectives) {
    const summoning = await hasDAO(dao.status.publicAddress);
    log(`[dao] Found DAO of type: ${(summoning && summoning.kind) ? summoning.kind : 'None'}...`);

    if (!summoning) {
      status = {
        loadPercentage: 100,
        blockchainSync: 'EMPTY',
        publicAddress: dao.status.publicAddress,
        message: TAPi18n.__('synchronizer-empty'),
      };
      log('[dao] No DAO activity on this address.');
      Collectives.update({ _id: dao._id }, { $set: { status } });
      return;
    } else if (summoning && summoning.kind) {
      status = {
        loadPercentage: 15,
        blockchainSync: 'SYNCING',
        publicAddress: dao.status.publicAddress,
        message: TAPi18n.__('synchronizer-found'),
      };
      Collectives.update({ _id: dao._id }, { $set: { status } });

      // clone template, do not copy bind
      editedTemplate = JSON.parse(JSON.stringify(_.findWhere(DAOTemplates, { kind: summoning.kind })));

      let daoState;
      for (const contract of editedTemplate.profile.blockchain.smartContracts) {
        if (contract.label === 'DAO') {
          contract.publicAddress = dao.status.publicAddress.toLowerCase();
        }
        if (contract.parameter) {
          daoState = await getState(contract, dao._id);

          for (const parameter of contract.parameter) {
            for (const key in daoState) {
              if (parameter.name === key) {
                switch (parameter.type) {
                  case 'Proposal':
                    parameter.value = 'struct';
                    break;
                  case 'address' || 'GuildBank':
                    parameter.value = daoState[key].toString().toLowerCase();
                    break;
                  default:
                    parameter.value = daoState[key].toString();
                }
              }
            }
          }
        }
      }
      for (const contract of editedTemplate.profile.blockchain.smartContracts) {
        if (contract.label === 'GuildBank' && daoState && daoState.guildBank) {
          contract.publicAddress = daoState.guildBank.toLowerCase();
        }
      }

      const ticker = _.findWhere(_.findWhere(editedTemplate.profile.blockchain.smartContracts, { label: 'DAO' }).parameter, { name: 'approvedToken' }).value;
      const coin = Tokens.findOne({ contractAddress: RegExp(['^', ticker, '$'].join(''), 'i') });
      for (const setting of editedTemplate.profile.guild) {
        if (setting.type === '{{tokenTicker}}') {
          setting.type = `token.${coin.code}`;
        }
      }

      // default descriptive values
      const domain = `${Meteor.settings.public.app.url.replace(/\/$/, '')}/dao/${dao.status.publicAddress.toLowerCase()}`;
      editedTemplate.name = (!dao.name || dao.name === '{{name}}') ? TAPi18n.__('scan-boilerplate-name').replace('{{init}}', dao.status.publicAddress.slice(2, 6).toUpperCase()).replace('{{end}}', dao.status.publicAddress.slice(38, 42).toUpperCase()) : dao.name;
      editedTemplate.profile.blockchain.publicAddress = dao.status.publicAddress.toLowerCase();
      editedTemplate.domain = (!dao.domain || dao.domain === '{{domain}}') ? domain : dao.domain;
      editedTemplate.profile.website = (!dao.profile.website || dao.profile.website === '{{website}}') ? domain : dao.profile.website;
      editedTemplate.profile.logo = (!dao.profile.logo || dao.profile.logo === '{{logo}}') ? `${Meteor.settings.public.app.url.replace(/\/$/, '')}/images/ethereum-landing.png` : dao.profile.logo;
      editedTemplate.profile.bio = (!dao.profile.bio || dao.profile.bio === '{{bio}}') ? TAPi18n.__('scan-boilerplate-bio').replace('{{DAOType}}', TAPi18n.__(`dao-type-${editedTemplate.kind.toLowerCase()}`)).replace('{{address}}', dao.status.publicAddress.toLowerCase()) : dao.profile.bio;
      log(`[dao] Dynamic name given to DAO is ${editedTemplate.name}`);

      // update in db
      Collectives.update({ _id: dao._id }, { $set: editedTemplate });

      // process events
      await _process(daoState, dao._id);
    }
  }
};


let _run = false;

/**
* @summary batch refresh instructions.
*/
const _refresh = async () => {
  log('[dao] Syncing with blockchain...');
  await _scan();
  await _process();
  await _update();
  await _compute();
  await sync();
  await oracles();
};

/**
* @summary setup DAOs on this server instance.
*/
const _setupDAOs = async () => {
  await _insert().then(async (res) => {
    if (res) {
      log('[dao] Initial DAO setup....');
      await _refresh();
      _run = true;
    }
  });
};

/**
* @summary main function
*/
const _main = async () => {
  await _setupTokens();
  await _setupDAOs();
};

if (Meteor.isServer) {
  _main();

  const cronjob = new CronJob({
    cronTime: defaults.CRON_JOB_TIMER,
    onTick: Meteor.bindEnvironment(async (job) => {
      if (_run) {
        _run = false;
        log('[cron] Start Cron Job...');
        await _refresh();
        job();
      } else {
        log('[cron] Awaiting setup to finish...');
      }
    }),
    onComplete: () => {
      log('[cron] Completed Cron Job.');
      _run = true;
    },
    start: true,
  });
  log(`[startup] Cron job started with schedule: '${cronjob.cronTime}'`);
}

export const compute = _compute;
export const update = _update;
export const refresh = _refresh;
export const scan = _scan;
export const install = _install;
