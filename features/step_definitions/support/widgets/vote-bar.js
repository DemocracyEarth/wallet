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
  };

  this.moveTo = (votesCommitted) => {
    // 1. Drag the handle to the exact spot, and then confirm the modal. It is too sketchy and unreliable.
    // The moveTo and buttonXXXX APIs of the webdriver are deprecated, try Actions when they're released.
    // getBrowser().moveToObject(handleQuery).buttonDown().moveToObject(barQuery, xPos).buttonUp();

    // 2. Hack around, grab the Vote instance from the draggable handle and call its API
    const bar = findOneDomElement(selectors.self);
    const barWidth = bar.getElementSize('width');
    const xPos = Math.ceil(barWidth * votesCommitted / 1000); // fixme : hardcoded thousand votes
    const voteId = bar.getAttribute('id').slice('voteBar-'.length);

    getBrowser().execute((voteId, votesCommitted, xPos) => {
      const vote = $('#voteHandle-'+voteId).draggable('widget')[0].newVote;
      if ( ! vote) { fail("Cannot find the vote instance. Did you refactor stuff ?"); }
      Session.set(voteId, vote);
      vote.sliderInput(xPos);
      vote.place(votesCommitted, false);
      vote.execute(()=>{ console.error("Vote was canceled.", vote); });
    }, voteId, votesCommitted, xPos);

    // 3. The dream way
    // theInstanceOfTheVoteBar.setVotesTo(votesCommitted).submit();
  };

}

widgets.voteBar = new VoteBarWidget();