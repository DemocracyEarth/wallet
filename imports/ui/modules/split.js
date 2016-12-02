import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { gui } from '/lib/const';

/**
* @summary simply draws each split panel
* @param {Number} left width of left panel in pixels
* @param {Number} right widht of right panel in pixels
*/
const _drawPanels = (left, right) => {
  const diff = parseInt(left - parseInt(($('.right').width() / 2), 10), 10);
  $('.split-left').width(left);
  $('.split-right').width(right);
  $('.split-right').css('marginLeft', diff);
};

/**
* @summary saves split preference of user
* @param {Number} left width of left panel in pixels
* @param {Number} right widht of right panel in pixels
*/
const _saveSplitSettings = (left, right) => {
  if (Meteor.userId() && (left !== null || right !== null)) {
    const data = Meteor.user().profile;
    const total = parseInt(left + right, 10);
    const leftPercentage = `${((left * 100) / total).toFixed(1).toString()}%`;
    const rightPercentage = `${((right * 100) / total).toFixed(1).toString()}%`;
    data.settings = {
      splitLeftWidth: leftPercentage,
      splitRightWidth: rightPercentage,
    };
    Meteor.users.update(Meteor.userId(), { $set: { profile: data } });
  }
};

/**
* @summary splits the view of panels based on user preference
*/
const _splitRender = () => {
  if ($('.split-right') && $('.split-left')) {
    const contentwidth = $('.right').width();
    const half = parseInt(contentwidth / 2, 10);
    if (Meteor.user().profile.settings) {
      const settings = Meteor.user().profile.settings;
      if (parseInt(settings.splitLeftWidth + settings.splitRightWidth, 10) === parseInt($('.right').width(), 10)) {
        _drawPanels(settings.splitLeftWidth, settings.splitRightWidth);
      } else {
        const oldWidth = parseInt(settings.splitLeftWidth + settings.splitRightWidth, 10);
        const leftPercentage = parseInt((settings.splitLeftWidth * 100) / oldWidth, 10);
        const rightPercentage = parseInt((settings.splitRightWidth * 100) / oldWidth, 10);
        _drawPanels(parseInt($('.right').width() * (leftPercentage / 100), 10), parseInt($('.right').width() * (rightPercentage / 100), 10));
      }
    } else if (Session.get('resizeSplitCursor').leftWidth) {
      _drawPanels(Session.get('resizeSplitCursor').leftWidth, Session.get('resizeSplitCursor').rightWidth);
    } else {
      _drawPanels(half, half);
    }
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
    const agoraWidth = parseInt(half - diff, 10);
    if (agoraWidth > gui.MIN_AGORA_WIDTH && agoraWidth < half) {
      $('.split-left').width(`${parseInt(half + diff, 10)}px`);
      $('.split-right').width(`${agoraWidth}px`);
      $('.split-right').css('marginLeft', diff);
    }
  }
};

/**
* @summary sets up split controller
*/
const _setupSplit = () => {
  if (Session.get('resizeSplit') === undefined) {
    Session.set('resizeSplit', false);
    Session.set('resizeSplitCursor', { x: 0, y: 0, leftWidth: 0, rightWidth: 0 });
  }
  $(window).mousemove((event) => {
    if (Session.get('resizeSplit')) {
      event.preventDefault();
      const delta = {
        x: parseInt(event.pageX - Session.get('resizeSplitCursor').x, 10),
        y: parseInt(event.pageY - Session.get('resizeSplitCursor').y, 10),
      };
      _resizeSplit(delta.x);
    }
  });
  $(window).mouseup(() => {
    if (Session.get('resizeSplit')) {
      Session.set('resizeSplit', false);
      Session.set('resizeSplitCursor', { leftWidth: $('.split-left').width(), rightWidth: $('.split-right').width() });
      _saveSplitSettings($('.split-left').width(), $('.split-right').width());
      // TODO: user % and you avoid the resizing trap
    }
  });
  $(window).resize(() => {
    if ($('.split-right')) {
      console.log('resize bitch');
    }
  });
};

export const setupSplit = _setupSplit;
export const splitRender = _splitRender;
export const resizeSplit = _resizeSplit;
