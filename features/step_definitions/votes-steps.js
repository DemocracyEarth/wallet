import {getUser, castNum} from './support/utils';

export default function () {

  this.Then(/^(.+) should have (.+) votes available$/, (name, votes) => {
    expect(getUser(name).profile.wallet.available).to.equal(castNum(votes));
  });

};
