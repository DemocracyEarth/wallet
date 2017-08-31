import {getBrowser, fail, findDomElements} from '../utils';

function FeedWidget() {
  const selectors = {
    items: '.content > .feed li .title-input > .title-input',
  };

  this.getItems = (titleFilter) => {
    const feed = findDomElements(selectors.items);

    if (typeof titleFilter === 'undefined') { return feed; }
    if (typeof titleFilter !== 'string') { fail(`Title filter (${titleFilter}) is not a string.`); }

    let filtered = [];
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Array_comprehensions Non standard >.<
    feed.forEach((feedItem) => { if (feedItem.getText().trim() == titleFilter.trim()) { filtered.push(feedItem); } });

    return filtered;
  };
}

widgets.feed = new FeedWidget();