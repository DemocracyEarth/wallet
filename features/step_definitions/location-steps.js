import {visit, getRoute, slugCase} from './support/utils';


export default function () {

  this.Given(/^I (?:am|go) (?:on|to) the page ['"`](.+)['"`]$/, (route) => {
    visit(route);
  });

  this.Then(/^I should be on the page ['"`](.+)['"`]$/, (route) => {
    expect(getRoute()).to.equal(route);
  });

  this.Given(/^I (?:am|go) (?:on|to) the homepage$/, () => {
    visit('/');
  });

  this.Then(/^I should be on the homepage$/, () => {
    expect(getRoute()).to.equal('/');
  });

  this.Given(/^I (?:am|go) (?:on|to) the page to propose an idea$/, () => {
    visit('/');  // can't go to a static url, the draft needs an id. How to get one here ?
    widgets.fab.click();
  });

  this.Then(/^I should be on the page to propose an idea$/, () => {
    expect(getRoute()).to.startWith('/vote/draft');
  });

  this.Given(/^I go on the detail page of the idea titled "(.+)"$/, (title) => {
    visit('/vote/' + slugCase(title));
  });

  this.Then(/^I should be on the detail page of the idea titled "(.+)"$/, (title) => {
    expect(getRoute()).to.equal('/vote/' + slugCase(title));
  });

};
