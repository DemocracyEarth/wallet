import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { gui } from '/lib/const';

/**
* @summary simply draws each split panel
* @param {String} left width of left panel in pixels or percentage
* @param {String} right widht of right panel in pixels or percentage
*/
const _drawPanels = (left, right) => {
  let leftPixels = left;
  let rightPixels = right;
  const total = parseInt($('.right').width(), 10);
  if (typeof right === 'string' && right.slice(-1) === '%') {
    leftPixels = parseInt((left.toNumber() * total) / 100, 10);
    rightPixels = parseInt((right.toNumber() * total) / 100, 10);
    Session.set('resizeSplitCursor', { leftWidth: leftPixels, rightWidth: rightPixels });
  }
  let diff = parseInt(leftPixels - parseInt(($('.right').width() / 2), 10), 10);
  if ($(window).width() < gui.DESKTOP_MIN_WIDTH) {
    leftPixels = '100%';
    rightPixels = '100%';
    diff = 0;
  }
  $('.split-left').width(leftPixels);
  $('.split-right').width(rightPixels);
  $('.split-right').css('marginLeft', diff);
  $('.split-left').css('marginLeft', 0);
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
    if (Meteor.user() !== null && Meteor.user().profile.settings) {
      const settings = Meteor.user().profile.settings;
      _drawPanels(settings.splitLeftWidth, settings.splitRightWidth);
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
    const contractWidth = parseInt(contentWidth - agoraWidth, 10);
    if (agoraWidth > gui.MIN_AGORA_WIDTH && contractWidth > gui.MIN_CONTRACT_WIDTH) {
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
    }
  });
  $(window).resize(() => {
    if ($('.split-right')) {
      const total = parseInt(Session.get('resizeSplitCursor').leftWidth + Session.get('resizeSplitCursor').rightWidth, 10);
      const diff = parseInt($('.right').width() - total, 10);
      let newLeft = parseInt(Session.get('resizeSplitCursor').leftWidth + diff, 10);
      let newRight = parseInt(Session.get('resizeSplitCursor').rightWidth, 10);
      if (newLeft < gui.MIN_CONTRACT_WIDTH) {
        newLeft = gui.MIN_CONTRACT_WIDTH;
        if (Session.get('sidebar')) {
          newRight = parseInt($(window).width() - (gui.SIDEBAR_WIDTH + newLeft), 10);
        } else {
          newRight = parseInt($(window).width() - newLeft, 10);
        }
      }
      _drawPanels(newLeft, newRight);
    }
  });
};

export const setupSplit = _setupSplit;
export const splitRender = _splitRender;
export const resizeSplit = _resizeSplit;
