import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

/**
* @summary splits the view of panels based on user preference
*/
const _splitRender = () => {
  if ($('.split-right') && $('.split-left')) {
    const contentwidth = $('.right').width();
    const half = parseInt(contentwidth / 2, 10);
    let diff = half;
    if (Session.get('resizeSplitCursor').x > 0) {
      diff = Session.get('resizeSplitCursor').x;
    }
    $('.split-left').width(`${parseInt(diff, 10)}px`);
    $('.split-right').width(`${half}px`);
  }
};

/**
* @summary resizes a split-panel view
* @param {Number} diff size of resizing in pixels
*/
const _resizeSplit = (diff) => {
  if ($('.split-right') && $('.split-left')) {
    const contentWidth = $('.right').width();
    const half = parseInt(contentWidth / 2, 10);
    $('.split-left').width(`${parseInt(half + diff, 10)}px`);
    $('.split-right').width(`${parseInt(half - diff, 10)}px`);
  }
};

/**
* @summary sets up split controller
*/
const _setupSplit = () => {
  if (Session.get('resizeSplit') === undefined) {
    Session.set('resizeSplit', false);
    Session.set('resizeSplitCursor', { x: 0, y: 0 });
  }

  $(window).mousemove((event) => {
    if (Session.get('resizeSplit')) {
      event.preventDefault();
      const delta = {
        x: parseInt(event.pageX - Session.get('resizeSplitCursor').x, 10),
        y: parseInt(event.pageY - Session.get('resizeSplitCursor').y, 10),
      };
      _resizeSplit(delta.x);
      $('.split-right').css('marginLeft', delta.x);
    }
  });
  $(window).mouseup(() => {
    Session.set('resizeSplit', false);
  });
};

export const setupSplit = _setupSplit;
export const splitRender = _splitRender;
export const resizeSplit = _resizeSplit;
