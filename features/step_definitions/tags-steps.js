import {fail, getServer} from "./support/utils";

export default function () {

  this.Given(/^there is a tag titled (.+)$/, (title) => {
    // todo: refactor using the (private!) createTag method in /imports/api/contracts/methods ? @santisiri
    const tag = getServer().execute((title) => {
      repository = require('/imports/api/tags/Tags').Tags;
      repository.insert({text: title});
      return repository.findOne({text: title});
    }, title);

    if ( ! tag) { fail('No tag was returned after tag creation.'); }
  });

  this.Then(/^there should (not)? ?be a tag titled (.+)$/, (not, title) => {
    const tag = getServer().execute((title) => {
      return require('/imports/api/tags/Tags').Tags.findOne({text: title});
    }, title);

    if (   not &&    tag) { fail(`There is a tag titled '${title}'.`); }
    if ( ! not &&  ! tag) { fail(`There is no tag titled '${title}'.`); }
  });

};
