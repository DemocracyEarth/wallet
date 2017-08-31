import {
  log, fail, visit, getBrowser, getServer, camelCase, refresh, pause,
  findByIdOrClass, findOneDomElement, findDomElements, clickOnElement, hasClass,
} from './support/utils';


export default function () {

  this.Given(/^I (?:am on|go to) the homepage$/, () => {
    visit('/');
  });

  this.When(/^I trigger the floating action button$/, () => {
    widgets.fab.click();
  });

  this.Then(/^I (?:wait|pause) (?:for)? *(\d+\.\d*|\d*\.\d+) ?s(?:econds?)?$/, (seconds) => {
    pause(seconds);
  });

  this.When(/^I (?:fill|set) the (.+) (?:with|to) "(.*)"$/, (elementQuery, content) => {
    let element = findByIdOrClass(camelCase(elementQuery));
    if ( ! element) { fail(`Could not find any editable DOM element for query '${elementQuery}'.`); }

    if (element.getAttribute('contenteditable') || hasClass(element, 'editable')) {
      element.click();
      element.keys(content);
    } else {  // here, add support for input fields
      fail(`DOM element found for query '${elementQuery}' seems not editable.`);
    }
  });

  this.When(/^I add the tag (.+)$/, (tagTitle) => {
    // There has got to be a generic way to create local functions wrapping a call on the server... Spread operator ?
    const tagSlug = getServer().execute((title) => { return require('/lib/utils').convertToSlug(title); }, tagTitle);
    clickOnElement(`#add-suggested-tag-${tagSlug}`); // might fail with more complex tag titles, tweak slugging
  });

  this.When(/^I remove my signature$/, () => {
    clickOnElement('#removeSignature');
    widgets.modal.confirm();
  });

  this.When(/^I sign the idea$/, () => {
    clickOnElement('#author-sign');
    widgets.modal.confirm();
  });

  this.When(/^I enable ballot voting$/, () => {
    clickOnElement('.toggle.ballotEnabled'); // an id pls
  });

  this.When(/^I submit the idea$/, () => {
    clickOnElement('a.button.execute.action-button');  // fix this with an id pls
    widgets.modal.confirm();
  });

  this.When(/^I confirm my choice$/, () => {
    widgets.modal.confirm();
  });

  this.Then(/^I should see "(.+)" in the page$/, (text) => {
    // It's not enough, as the source here is the one initially provided by the server, not from an up-to-date DOM.
    // const source = getBrowser().source().value;
    const pageText = getBrowser().getText('body');
    // expect(pageText.includes(text)).to.be.true; // Sweet, but not very verbose nor explicit when it fails
    if ( ! pageText.includes(text)) {
      log("PAGE CONTENTS");
      log("-------------");
      log(pageText); // Log here because multi-line Error message are wrongly colored in Chimp.
      fail(`Failed to find the text "${text}" in the source.`);
    }
  });

  this.Then(/^I should see "(.+)" in the feed$/, (text) => {
    const feed = widgets.feed.getItems(text);

    if (0 == feed.length) { fail(`Could not find the text "${text}" in the feed.`); }
  });

  this.Then(/^I (?:click on|select) "(.+)" in the feed$/, (text) => {
    let found = widgets.feed.getItems(text);

    if (1 > found.length) { fail(`Could not find the text "${text}" in the feed.`); }
    if (1 < found.length) { fail(`Ambiguous click : too many items in the feed match the title "${text}".`); }

    found[0].click();
  });

  this.Then(/^I (?:click on|select) the (Yes|No) ballot option$/, (yesno) => {
    const query = "#ballotOption #tickbox";  // T_T ; (it actually works and returns 2 elements)
    const ballots = findDomElements(query);

    if (0 == ballots.length) { fail(`Could not find a ballot option to click on.`); }
    if (3 <= ballots.length) { fail(`Ambiguous ballot click : too many (${ballots.length}) tickboxes found.`); }

    if      (yesno == 'Yes') { ballots[0].click(); }
    else if (yesno == 'No')  { ballots[1].click(); }
  });

  this.Then(/^I commit all my votes to the idea$/, () => {
    widgets.voteBar.moveToRight();
    widgets.modal.confirm();
  });

  this.Then(/^I commit (\d+) votes to the idea$/, (votesCommitted) => {
    widgets.voteBar.moveTo(votesCommitted);
    widgets.modal.confirm();
    // We can't use this step twice in the same page load, it will bug because it's a hack. Feel free to fix it!
    log("Reloading the whole page as well…");
    refresh(); // reloading the whole page makes using this step twice in a row OK
  });



};
