import {log, getUser, getIdeas} from './support/utils';


export default function () {

  this.Then(/^I use a pystring$/, (pystring) => {  // A pystring is a multiline string wrapped by `"""`.
    log(pystring);
  });

  this.Then(/^I (?:dump|print) the citizen (.+)$/, (name) => {
    log(getUser(name));
  });

  this.Then(/^I (?:dump|print) (?:all )?the ideas$/, () => {
    log(getIdeas());
  });

};