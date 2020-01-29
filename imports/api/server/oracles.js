import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';

import { log } from '/lib/const';

const gini = require('gini');

const _calculateGini = (collective) => {
  log(`{ oracle: 'calculateGini', collective: '${collective._id}' }`);

  if (!collective.profile.replica) {
    const members = Meteor.users.find({ 'profile.collectives': [collective._id] }).fetch();
    const set = [];
    for (const individual of members) {
      for (const value of individual.profile.wallet.reserves) {
        if (value.token === 'MOLOCH' && value.balance > 0) {
          set.push(value.balance);
        }
      }
    }

    console.log('--------------------------');
    console.log(gini.unordered(set));
  }
};

const _calculateRanking = () => {
}


const _setReplicaScore = (user) => {
  console.log('--------------------------');
  log(`{ oracle: 'setReplicaScore', user: '${user._id}' }`);

  let collective;
  for (const collectiveId of user.profile.collectives) {
    collective = Collectives.findOne({ _id: collectiveId });
    if (collective) {
      _calculateGini(collective);
    }
  }
};

export const setReplicaScore = _setReplicaScore;

