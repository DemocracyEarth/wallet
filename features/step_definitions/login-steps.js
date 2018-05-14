import { clickOnElement, getBrowser, typeInInput, randomUsername, randomPassword, randomEmail } from './support/utils';

export default function () {
  let userName;
  let firstName;
  let lastName;
  let pass;
  let email;

  function login(badpass) {
    getBrowser().waitForVisible('#signin-button');
    typeInInput('signin-email', email);
    typeInInput('signin-password', badpass ? randomPassword() : pass);
    getBrowser().click('#signin-button');
  }

  function register() {
    getBrowser().waitForVisible('input[name="username-signup"]');
    typeInInput('username-signup', userName);
    typeInInput('email-signup', email);
    typeInInput('password-signup', pass);
    typeInInput('mismatchPassword', pass);
    clickOnElement('#signup-button');
  }

  this.When(/^I register with some name, password and email$/, function () {
    userName = randomUsername();
    email = randomEmail();
    pass = randomPassword();
    register();
  });

  this.Given(/^I am a registered citizen with name (.+)$/, function (name) {
    widgets.loggedUserButton.click();
    getBrowser().waitForVisible('#signup');
    clickOnElement('#signup');
    userName = name.replace(/[ .]/g, '');
    email = randomEmail();
    pass = randomPassword();
    register();
    getBrowser().waitForVisible('#action');
    getBrowser().pause(2000);

    context.I = name;
  });

  this.Then(/^I should be registered$/, function () {
    getBrowser().waitForVisible('#logout');
  });

  this.Then(/^I should be logged in$/, function () {
    getBrowser().waitForVisible('#action');
  });

  this.When(/^I sign out$/, function () {
    clickOnElement('#logout');
    getBrowser().waitForVisible('#logout', 10000, true);
  });

  this.When(/^I enter my email and password$/, function () {
    login();
  });

  this.Then(/^I can edit my profile$/, function () {
    getBrowser().waitForVisible('#logout');
    firstName = randomUsername();
    lastName = randomUsername();
    typeInInput('editFirstName', firstName);
    typeInInput('editLastName', lastName);
    getBrowser().click('#save-profile');
    getBrowser().waitForText('.identity-label', `${firstName} ${lastName}`);
    getBrowser().waitForText('.vote-available', '1,000 TOTAL VOTES');
  });

  this.When(/^I enter incorrect authentication information$/, function () {
    login(true);
  });

  this.Then(/^I should see a user not found error$/, function () {
    getBrowser().waitForText('.warning', 'User not found.');
  });
}
