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
  log(`{ oracle: 'calculateGini', collective: '${collective._id}' }`);

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
  return 1;
};

/**
* @summary persists the score of a replica to a given collective
* @param {string} collectiveId to calculate different replica attributes
* @return {object} with replica values
*/
const _setCollectiveReplicaScore = (collectiveId) => {
  log(`{ oracle: '_setCollectiveReplicaScore', collectiveId: '${collectiveId}' }`);
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
      log(`[web3] Updating collective ${collectiveId} with replica: ${JSON.stringify(replica)}`);
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
  log(`{ oracle: 'setReplicaScore', user: '${user._id}' }`);

  const collectiveReplicas = [];
  if (user.profile.collectives && user.profile.collectives.length > 0) {
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
        log(`[web3] Updating user ${user._id} with replica: ${JSON.stringify(replica)}`);
        Meteor.users.update({ _id: user._id }, { $set: { 'profile.replica': replica } });
      }
    }
  }
};

export const setReplicaScore = _setReplicaScore;

