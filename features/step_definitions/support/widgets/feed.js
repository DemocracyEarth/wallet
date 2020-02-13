import {getBrowser, fail, findDomElements} from '../utils';

class FeedWidget extends widgets.Base {

  get selectors() { return {
    // self: '#action',
    items: '.content > .feed li .title-input > .title-input',
  }; }

  getItems (titleFilter) {
    const feed = findDomElements(this.selectors.items);

    if (typeof titleFilter === 'undefined') { return feed; }
    if (typeof titleFilter !== 'string') { fail(`Title filter (${titleFilter}) is not a string.`); }

    let filtered = [];
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Array_comprehensions Non standard >.<
    feed.forEach((feedItem) => { if (feedItem.getText().trim() == titleFilter.trim()) { filtered.push(feedItem); } });

    return filtered;
  };
}

widgets.Feed = FeedWidget;
widgets.feed = new FeedWidget();