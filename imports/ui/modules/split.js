import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { gui } from '/lib/const';

const LEFTHALF = 0.6;
const RIGHTHALF = 0.4;

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
* @summary resizes a split-panel view
* @param {Number} diff size of resizing in pixels
* @param {boolean} winResize if call is coming from a window resize
*/
const _resizeSplit = (diff, winResize) => {
  if ($('.split-right') && $('.split-left')) {
    const contentWidth = $('.right').width();
    const agoraWidth = parseInt((contentWidth * RIGHTHALF) - diff, 10);
    const contractWidth = parseInt((contentWidth * LEFTHALF) + diff, 10);
    if ((agoraWidth > gui.MIN_AGORA_WIDTH && contractWidth > gui.MIN_CONTRACT_WIDTH) || winResize) {
      $('.split-left').width(`${contractWidth}px`);
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
    Session.set('resizeSplitCursor', { x: 0, y: 0, leftWidth: '60%', rightWidth: '40%' });
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
  $(window).resize((event) => {
    if ($('.split-right')) {
      event.preventDefault();
      if ($(window).width() < gui.DESKTOP_MIN_WIDTH) {
        $('.split-left').width('100%');
        $('.split-right').width('100%');
        $('.split-right').css('marginLeft', 0);
        $('.split-left').css('marginLeft', 0);
      } else {
        _resizeSplit(0, true);
      }
      if (Meteor.Device.isPhone() || window.innerWidth <= 991) {
        Session.set('scrollerDiv', '.right');
      } else {
        Session.set('scrollerDiv', '.split-left');
      }
    }
  });
};

export const setupSplit = _setupSplit;
export const resizeSplit = _resizeSplit;
