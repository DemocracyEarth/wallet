import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';
import { TAPi18n } from 'meteor/tap:i18n';

import { getEvents, syncDAOGuilds, getBlockHeight, getLastTimestamp, hasDAO, getState } from '/lib/web3';
import { log, defaults } from '/lib/const';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Tokens } from '/imports/api/tokens/tokens';
import { oracleReplicas } from '/imports/startup/both/modules/oracles';
import { DAOTemplates } from '/lib/templates';


import { CronJob } from 'cron';

const daoCollectives = [];
let initialDAOCount = 0;
let finishedSetup = false;

const _daoToCollective = (dao) => {
  Collectives.insert(dao, (error, result) => {
    if (error) {
      log('[dao WARNING] Insert Error.');
      log(error);
    }
    if (result) {
      log('[dao] Successfully inserted');
      daoCollectives.push(Collectives.find({ _id: result }).fetch()[0]);
    }
  });
};


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
* @summary inserts all daos listed on json to database
*/
const _insertDAOs = async () => {
  const daoJSON = 'lib/dao.json';
  log('[dao] Setting up Distributed Autonomous Organizations..');

  const dao = JSON.parse(Assets.getText(daoJSON)).dao; // eslint-disable-line no-undef
  log(`[dao] Found a total of ${dao.length} DAOs in JSON settings`);
  initialDAOCount = dao.length;

  if (!dao) {
    log('[dao WARNING] No DAO settings found.');
    log("[dao FIX] Add 'lib/dao.json' with list of DAOs to be supported using a Schema.Blockchain object inside a 'dao' Array.");
    return undefined;
  }

  let collective = [];
  for (let i = 0; i < dao.length; i += 1) {
    log(`[dao] Adding DAO with domain ${dao[i].domain}...`);
    collective = Collectives.find({ domain: dao[i].domain }).fetch();

    if (collective.length === 0) {
      dao[i].createdAt = new Date();
      dao[i].timestamp = new Date();
      dao[i].lastUpdate = new Date();
      _daoToCollective(dao[i]);
    } else {
      log('[dao] DAO already found in db.');
      daoCollectives.push(collective[0]);
    }
    collective = [];
  }
  return daoCollectives;
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
const _computeDAOStats = () => {
  const collectives = Collectives.find().fetch();
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
* @summary dynamic refresh while app runs on latest activity per smart contract
*/
const _refreshDAOs = async () => {
  let collectives;
  let noCollectives = true;
  while (noCollectives) {
    collectives = Collectives.find().fetch();
    console.log(`[dao] The initial DAO count is: ${initialDAOCount}`);
    console.log(`[dao] Current Collective count is: ${collectives.length}`);
    if (collectives.length >= initialDAOCount) {
      noCollectives = false;
    } else {
      noCollectives = true;
    }
  }
  const currentBlock = await getBlockHeight();

  log(`[dao] Refreshing DAO activity to block height ${currentBlock}...`);

  let syncFrom;
  for (let i = 0; i < collectives.length; i += 1) {
    console.log(`[dao] Last synced block on server for collective ${collectives[i].name} is ${collectives[i].profile.lastSyncedBlock} and the current block: ${currentBlock}`);
    if ((collectives[i].profile.lastSyncedBlock < currentBlock) || !collectives[i].profile.lastSyncedBlock) {
      if (collectives[i].profile.blockchain && collectives[i].profile.blockchain.smartContracts && collectives[i].profile.blockchain.smartContracts.length > 0) {
        for (let k = 0; k < collectives[i].profile.blockchain.smartContracts.length; k += 1) {
          syncFrom = (collectives[i].profile.lastSyncedBlock) ? (collectives[i].profile.lastSyncedBlock + 1) : defaults.START_BLOCK;
          if (syncFrom < currentBlock) {
            console.log(`[dao] Get events for ${collectives[i].name}, smart contract: ${collectives[i].profile.blockchain.smartContracts[k].label}, syncing from ${syncFrom} to block: ${currentBlock}`);
            // await getEvents(collectives[i].profile.blockchain.smartContracts[k], collectives[i]._id, syncFrom, currentBlock);
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
const _updateProposalPeriods = async () => {
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
* @summary given a public address, it scans the activity behind it
*/
const _scan = async () => {
  const collectives = Collectives.find({ $or: [{ 'status.blockchainSync': 'SETUP' }, { 'status.blockchainSync': 'SYNCING' }] }).fetch();
  log(`[dao] Scanning ${collectives.length} new addresses....`);

  let status;
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
        loadPercentage: 25,
        blockchainSync: 'SYNCING',
        publicAddress: dao.status.publicAddress,
        message: TAPi18n.__('synchronizer-found'),
      };
      log(`[dao] Found a ${summoning.kind} DAO on this address...`);
      Collectives.update({ _id: dao._id }, { $set: { status } });

      let editedTemplate;
      switch (summoning.kind) {
        case 'MOLOCH':
        default:
          for (const template of DAOTemplates) {
            if (template.kind === 'MOLOCH') {
              editedTemplate = template;

              editedTemplate.name = TAPi18n.__('scan-boilerplate-name').replace('{{init}}', dao.status.publicAddress.slice(2, 6).toUpperCase()).replace('{{end}}', dao.status.publicAddress.slice(38, 42).toUpperCase());
              editedTemplate.profile.blockchain.publicAddress = dao.status.publicAddress.toLowerCase();

              let daoState;
              for (const contract of editedTemplate.profile.blockchain.smartContracts) {
                if (contract.publicAddress === '{{publicAddress}}') {
                  contract.publicAddress = dao.status.publicAddress.toLowerCase();
                }
                if (contract.label === 'DAO') {
                  daoState = await getState(contract);

                  for (const parameter of contract.parameter) {
                    for (const key in daoState) {
                      if (parameter.name === key) {
                        parameter.value = daoState[key].toString();
                      }
                    }
                  }
                }
              }
              for (const contract of editedTemplate.profile.blockchain.smartContracts) {
                if (contract.label === 'GuildBank' && daoState.approvedToken) {
                  contract.publicAddress = daoState.approvedToken.toLowerCase();
                }
              }

              console.log('LES SMART CONTRACTS....');
              console.log(editedTemplate.profile.blockchain.smartContracts);

              // defaults
              const domain = `${Meteor.settings.public.app.url.replace(/\/$/, '')}/dao/${dao.status.publicAddress.toLowerCase()}`;
              editedTemplate.domain = domain;
              editedTemplate.profile.website = domain;
              editedTemplate.profile.logo = `${Meteor.settings.public.app.url.replace(/\/$/, '')}/images/ethereum-landing.png`;
              editedTemplate.profile.bio = TAPi18n.__('scan-boilerplate-bio').replace('{{DAOType}}', TAPi18n.__(`dao-type-${template.kind.toLowerCase()}`)).replace('{{address}}', dao.status.publicAddress.toLowerCase());

              console.log('TEMPLATE A SALVAR:');
              console.log(editedTemplate);

              Collectives.update({ _id: dao._id }, { $set: editedTemplate });
              break;
            }
          }
          // await getEvents(dao.profile.blockchain.smartContracts[k], collectives[i]._id, syncFrom, currentBlock);
          console.log('INSERT A MOLOCH HERE');
      }
    }
  }
};

/**
* @summary batch refresh instructions.
*/
const _refresh = async () => {
  log('[dao] Refreshing DAO data....');
  await _refreshDAOs();
  await _updateProposalPeriods();
  await _computeDAOStats();
  await syncDAOGuilds();
  await _scan();
};

/**
* @summary setup DAOs on this server instance.
*/
const _setupDAOs = async () => {
  await _insertDAOs().then(async (res) => {
    if (res) {
      log('[dao] Initial DAO setup....');
      await _refresh();
      finishedSetup = true;
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
    onTick: Meteor.bindEnvironment(async () => {
      if (finishedSetup) {
        log('[cron] Syncing with blockchain...');
        await _refresh();
        oracleReplicas();
      } else {
        log('[cron] Awaiting setup to finish...');
      }
    }),
    start: true,
  });
  log(`[startup] Cron job started with schedule: '${cronjob.cronTime}'`);
}

export const computeDAOStats = _computeDAOStats;
export const updateProposalPeriods = _updateProposalPeriods;
export const refreshDAOs = _refreshDAOs;
export const refresh = _refresh;
export const scan = _scan;

