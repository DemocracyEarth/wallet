import {log, fail, getServer, getRoute} from './support/utils';

export default function () {

  this.Then(/^there should (not)? ?be a tag titled (.+)$/, (not, title) => {
    const tag = getServer().execute((title) => {
      return require('/imports/api/tags/Tags').Tags.findOne({text: title});
    }, title);

    if (   not &&    tag) { fail(`There is a tag titled '${title}'.`); }
    if ( ! not &&  ! tag) { fail(`There is no tag titled '${title}'.`); }
  });

  this.Then(/^there should (not)? ?be an idea titled "(.+)"$/, (not, title) => {
    const idea = getServer().execute((title) => {
      return require('/imports/api/contracts/Contracts').Contracts.findOne({title: title});
    }, title);

    if (   not &&    idea) { fail(`There is an idea titled '${title}'.`); }
    if ( ! not &&  ! idea) { fail(`There is no idea titled '${title}'.`); }
  });

  this.Then(/^I should be on the page (.+)$/, (route) => {
    const mapping = {
      'to propose an idea': '/vote/draft',
    };
    if (mapping[route]) route = mapping[route];
    expect(getRoute()).to.startWith(route);
  });

};
