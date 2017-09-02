import {log, getUser} from './support/utils';


export default function () {

  this.Then(/^I dump the citizen (.+)$/, (name) => {
    log(getUser(name));
  });

  this.Then(/^I use a pystring$/, (pystring) => {  // Last step var is the pystring (multiline string wrapped by `"""`)
    log(pystring);
  });

};