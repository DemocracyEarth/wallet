import { Collectives } from '/imports/api/collectives/Collectives';

import { log } from '/lib/const';

const _calculateGini = (collective) => {
  log(`{ oracle: 'calculateGini', collective: '${collective._id}' }`);

};

const _calculateRanking = () => {
}


const _setReplicaScore = (user) => {
  console.log('--------------------------');
  log(`{ oracle: 'setReplicaScore', user: '${user._id}' }`);
  console.log(user);

  let collective;
  for (const collectiveId of user.profile.collectives) {
    console.log(user.profile.collectives);
    collective = Collectives.findOne({ _id: collectiveId });
    console.log(collective);
    if (collective) {
      _calculateGini(collective);
    }
  }
};

export const setReplicaScore = _setReplicaScore;

