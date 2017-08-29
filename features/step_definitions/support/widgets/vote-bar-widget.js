import {log, getBrowser, findOneDomElement} from '../utils';

function VoteBarWidget() {
  const selectors = {
    self: '.result.vote-bar',
    handle: '.vote-bar > .handle',
  };

  this.moveToRight = () => {
    // buttonDown and buttonUp are deprecated ; how can we do this without them ? Actions API is not released yet.
    // https://github.com/webdriverio/webdriverio/issues/1653
    const bar = findOneDomElement(selectors.self);
    const handle = findOneDomElement(selectors.handle);
    const barWidth = bar.getElementSize('width');
    const handleWidth = handle.getElementSize('width');
    const xPad = handleWidth / 2;
    // this complicated flow is ... complicated. Try simpler things yourselves, see what happens. Weird, eh?
    getBrowser().moveToObject(selectors.handle, xPad, xPad);
    getBrowser().buttonDown();
    getBrowser().pause(100);
    for (let i = 0 ; i <= barWidth * 1.6 ; i = i + 100) {
      getBrowser().pause(100);
      getBrowser().moveToObject(selectors.self, i, 0);
    }
    getBrowser().pause(100);
    getBrowser().buttonUp();
  }
}

widgets.voteBar = new VoteBarWidget();