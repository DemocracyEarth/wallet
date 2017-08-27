import {log} from './support/utils';


export default function () {

  this.Then(/^I dump the citizen (.+)$/, (name) => {
    log(this.getUser(name));
  });

};