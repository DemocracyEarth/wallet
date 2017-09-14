import {visit, getRoute, slugCase} from './support/utils';


export default function () {

  const routeConstraints = {
    'to propose an idea': '/vote/draft',  // ?id=XXXXX
  };

  this.Given(/^I (?:am|go) (?:on|to) the page (.+)$/, (route) => {
    if (routeConstraints[route]) { route = routeConstraints[route]; }
    visit(route);
  });

  this.Then(/^I should be on the page (.+)$/, (route) => {
    if (routeConstraints[route]) { expect(getRoute()).to.startWith(routeConstraints[route]); }
    else                         { expect(getRoute()).to.equal(route); }
  });

  this.Given(/^I (?:am|go) (?:on|to) the homepage$/, () => {
    visit('/');
  });

  this.Given(/^I should be on the homepage$/, () => {
    expect(getRoute()).to.equal('/');
  });

  this.Given(/^I go on the detail page of the idea titled "(.+)"$/, (title) => {
    visit('/vote/' + slugCase(title));
  });

  this.Then(/^I should be on the detail page of the idea titled "(.+)"$/, (title) => {
    expect(getRoute()).to.equal('/vote/' + slugCase(title));
  });

};
