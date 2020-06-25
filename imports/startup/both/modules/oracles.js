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
  log(`[oracle] Calculating Gini coefficient for collective: '${collective.uri}'`);

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
    log(`[oracle] Gini score of collective ${collective._id}: ${gini}`);
    return gini;
  }
  return 1;
};

/**
* @summary caclulcates the ranking of a collective based on the votes of participants
*/
const _calculateRankings = () => {
  const values = [];
  const collectives = _.sortBy(Collectives.find().fetch(), (item) => { values.push(_.findWhere(item.profile.guild, { name: 'guild-total-value' }).value.toNumber()); return values.slice(-1); });
  const valueList = _.sortBy(_.uniq(values), (num) => { return num; });
  let daoValue;
  let position;
  for (const dao of collectives) {
    daoValue = _.findWhere(dao.profile.guild, { name: 'guild-total-value' }).value.toNumber();
    position = _.indexOf(valueList, daoValue).toNumber();
    dao.profile.replica.ranking = parseFloat(position / (valueList.length - 1), 10);

    log(`[oracle] The DAO ${dao.name} has a ranking of ${dao.profile.replica.ranking}`);
    Collectives.update({ _id: dao._id }, { $set: { 'profile.replica.ranking': dao.profile.replica.ranking } });
  }
};

/**
* @summary persists the score of a replica to a given collective
* @param {string} collectiveId to calculate different replica attributes
* @param {number} height of current chain
* @return {object} with replica values
*/
const _setCollectiveReplicaScore = async (collectiveId, height) => {
  const collective = Collectives.findOne({ _id: collectiveId });
  log(`[oracle] Setting replica score for dao: '${collective.uri}'`);
  let replica;
  if (collective) {
    const gini = _calculateGini(collective);
    const ranking = collective.profile.replica.ranking;
    const score = parseFloat(((1 - gini) + ranking) / 2, 10);
    const lastSyncedBlock = height; // await getBlockHeight(); // 0 // collective.profile.lastSyncedBlock ? collective.profile.lastSyncedBlock : 0;

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
* @return {object} with replica values
*/
const _setReplicaScore = (user, height) => {
  const collectiveReplicas = [];
  if (user.profile.collectives && user.profile.collectives.length > 0) {
    log(`[oracle] Setting replica score for user: '${user.username}'`);

    for (const collectiveId of user.profile.collectives) {
      collectiveReplicas.push(_setCollectiveReplicaScore(collectiveId, height));
    }

    if (collectiveReplicas.length > 0) {
      const score = parseFloat(_.reduce(_.pluck(collectiveReplicas, 'score'), (memo, num) => { return memo + num; }) / collectiveReplicas.length, 10);
      const lastSyncedBlock = _.max(_.pluck(collectiveReplicas, 'lastSyncedBlock'));

      const replica = {
        lastSyncedBlock,
        score,
      };
      if (!user.profile.replica || (user.profile.replica && user.profile.replica.lastSyncedBlock < lastSyncedBlock)) {
        log(`[oracle] Updating user ${user._id} with replica: ${JSON.stringify(replica)}`);
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

  log(`[oracle] Refreshing replica scores for ${pendingReplicas.length} users...`);

  if (pendingReplicas.length > 0) {
    _calculateRankings();
    for (const user of pendingReplicas) {
      _setReplicaScore(user, blockHeight);
    }
  }
};

export const oracles = _oracles;

