import {log, getServer, getUser, getIdeas} from './support/utils';


export default function () {

  this.Then(/^I (?:dump|print) the citizen (.+)$/, (name) => {
    log(getUser(name));
  });

  this.Then(/^I use a pystring$/, (pystring) => {  // Last step var is the pystring (multiline string wrapped by `"""`)
    log(pystring);
  });

  this.Then(/^I (?:dump|print) (?:all )?the ideas$/, () => {
    log(getIdeas());
  });

};