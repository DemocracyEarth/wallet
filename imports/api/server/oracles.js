import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';

import { log } from '/lib/const';

const giniCalculator = require('gini');

/**
* @summary caclulcates the gini of a collective based on the shares and addresses
* @param {object} collective collection from db to calculate
* @return {number} with gini value
*/
const _calculateGini = (collective) => {
  log(`[oracle] Calculating Gini coefficient for collective: '${collective._id}'`);

  const members = Meteor.users.find({ 'profile.collectives': [collective._id] }).fetch();
  const set = [];
  for (const individual of members) {
    for (const value of individual.profile.wallet.reserves) {
      if (value.token === collective.profile.wallet.currency && value.balance > 0) {
        set.push(value.balance);
      }
    }
  }
  const gini = giniCalculator.unordered(set);
  return gini;
};

/**
* @summary caclulcates the ranking of a collective based on the votes of participants
*/
const _calculateRanking = () => {
  return 0;
};

/**
* @summary persists the score of a replica to a given collective
* @param {string} collectiveId to calculate different replica attributes
* @return {object} with replica values
*/
const _setCollectiveReplicaScore = (collectiveId) => {
  log(`[oracle] Setting replica score for collective: '${collectiveId}'`);
  const collective = Collectives.findOne({ _id: collectiveId });
  let replica;
  if (collective) {
    const gini = _calculateGini(collective);
    const ranking = _calculateRanking(collective);
    const score = parseFloat((gini + ranking) / 2, 10);
    const lastSyncedBlock = collective.profile.lastSyncedBlock ? collective.profile.lastSyncedBlock : 0;

    replica = {
      lastSyncedBlock,
      gini,
      ranking,
      score,
    };

    if (!collective.profile.replica || (collective.profile.replica && collective.profile.replica.lastSyncedBlock < lastSyncedBlock)) {
      log(`[oracle] Updating collective ${collectiveId} with replica: ${JSON.stringify(replica)}`);
      Collectives.update({ _id: collectiveId }, { $set: { 'profile.replica': replica } });
    }
  }
  return replica;
};

/**
* @summary calculates the score of a user and every related collective
* @param {object} user that needs update on replica score
* @return {object} with replica values
*/
const _setReplicaScore = (user) => {
  const collectiveReplicas = [];
  if (user.profile.collectives && user.profile.collectives.length > 0) {
    log(`[oracle] Setting replica score for user: '${user._id}'`);

    for (const collectiveId of user.profile.collectives) {
      collectiveReplicas.push(_setCollectiveReplicaScore(collectiveId));
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

const _oracleReplicas = () => {
  const pendingReplicas = Meteor.users.find({ 'profile.replica': { $exists: false } }).fetch();
  log(`[oracle] Refreshing replica scores for ${pendingReplicas.length} users...`);

  for (const user of pendingReplicas) {
    _setReplicaScore(user);
  }
};

export const oracleReplicas = _oracleReplicas;

