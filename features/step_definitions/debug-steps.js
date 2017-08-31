import {log, getUser} from './support/utils';


export default function () {

  this.Then(/^I dump the citizen (.+)$/, (name) => {
    log(getUser(name));
  });

};