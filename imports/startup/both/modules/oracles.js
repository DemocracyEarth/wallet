import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';

import { getBlockHeight } from '/lib/web3';
import { log, defaults } from '/lib/const';

const giniCalculator = require('gini');

/**
* @summary caclulcates the gini of a collective based on the shares and addresses
* @param {object} collective collection from db to calculate
* @return {number} with gini value
*/
const _calculateGini = (collective) => {
  const members = Meteor.users.find({ 'profile.collectives': collective._id }).fetch();
  const set = [];
  for (const individual of members) {
    for (const value of individual.profile.wallet.reserves) {
      if (value.publicAddress === collective.profile.blockchain.publicAddress && value.balance > 0) {
        set.push(value.balance);
      }
    }
  }

  if (set.length > 0) {
    const gini = giniCalculator.unordered(set);
    log(`[oracle] Gini score of collective ${collective.uri}: ${gini}`);
    return gini;
  }
  return 1;
};

/**
* @summary caclulcates the ranking of a collective based on the votes of participants
*/
const _calculateRanking = (collective, valueList) => {
  const guild = _.findWhere(collective.profile.guild, { name: 'guild-total-value' });
  let daoValue;
  if (guild && guild.value) {
    daoValue = guild.value.toNumber();
  } else {
    daoValue = 0;
  }
  const position = _.indexOf(valueList, daoValue).toNumber();
  const ranking = parseFloat(position / (valueList.length - 1), 10);

  log(`[oracle] Calculating Ranking position for collective '${collective.uri}' at ${ranking}`);
  return ranking;
};

/**
* @summary persists the score of a replica to a given collective
* @param {string} collectiveId to calculate different replica attributes
* @param {number} height of current chain
* @param {array} valueRank with value of each dao sorted ascending
* @return {object} with replica values
*/
const _setCollectiveReplicaScore = (collectiveId, height, valueRank) => {
  const collective = Collectives.findOne({ _id: collectiveId });
  log(`[oracle] Setting replica score for dao: '${collective.uri}'`);

  let replica;
  if (collective) {
    const gini = _calculateGini(collective);
    const ranking = _calculateRanking(collective, valueRank);
    const score = parseFloat(((1 - gini) + ranking) / 2, 10);
    const lastSyncedBlock = height;

    replica = {
      lastSyncedBlock,
      gini,
      ranking,
      score,
    };

    if (!collective.profile.replica || (collective.profile.replica && collective.profile.replica.lastSyncedBlock < lastSyncedBlock)) {
      log(`[oracle] Updating collective ${collective.uri} with replica: ${JSON.stringify(replica)}`);
      Collectives.update({ _id: collectiveId }, { $set: { 'profile.replica': replica } });
    }
  }
  return replica;
};

/**
* @summary calculates the score of a user and every related collective
* @param {object} user that needs update on replica score
* @param {number} height of current chain
* @param {array} valueRank with value of each dao sorted ascending
* @return {object} with replica values
*/
const _setReplicaScore = (user, height, valueRank) => {
  const collectiveReplicas = [];
  if (user.profile.collectives && user.profile.collectives.length > 0) {
    log(`[oracle] Setting replica score for user: '${user.username}'`);

    for (const collectiveId of user.profile.collectives) {
      collectiveReplicas.push(_setCollectiveReplicaScore(collectiveId, height, valueRank));
    }

    if (collectiveReplicas.length > 0) {
      const score = parseFloat(_.reduce(_.pluck(collectiveReplicas, 'score'), (memo, num) => { return memo + num; }) / collectiveReplicas.length, 10);
      const lastSyncedBlock = _.max(_.pluck(collectiveReplicas, 'lastSyncedBlock'));

      const replica = {
        lastSyncedBlock,
        score,
      };
      if (!user.profile.replica || (user.profile.replica && user.profile.replica.lastSyncedBlock < lastSyncedBlock)) {
        log(`[oracle] Updating user ${user.username} with replica: ${JSON.stringify(replica)}`);
        Meteor.users.update({ _id: user._id }, { $set: { 'profile.replica': replica } });
      }
    }
  }
};

/**
* @summary general function to call oracles
*/
const _oracles = async () => {
  const blockHeight = await getBlockHeight();
  const pendingReplicas = Meteor.users.find({ $or: [{ 'profile.replica': { $exists: false } }, { 'profile.replica.lastSyncedBlock': { $lt: parseInt(blockHeight - defaults.ORACLE_BLOCKTIME, 10) } }] }).fetch();
  const pendingCollectives = Collectives.find({ 'status.blockchainSync': 'SYNCING' }).fetch();

  log(`[oracle] Refreshing replica scores for ${pendingReplicas.length} users and still awaiting ${pendingCollectives} daos...`);

  if (pendingReplicas.length > 0 || pendingCollectives.length > 0) {
    const values = [];
    const collectives = Collectives.find().fetch();

    for (const dao of collectives) {
      const guild = _.findWhere(dao.profile.guild, { name: 'guild-total-value' });
      if (guild && guild.value) {
        values.push(guild.value.toNumber());
      }
    }
    const valueRank = _.sortBy(_.uniq(values), (num) => { return num; });

    for (const user of pendingReplicas) {
      _setReplicaScore(user, blockHeight, valueRank);
    }
  }
};

export const oracles = _oracles;

