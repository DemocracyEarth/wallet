import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { animationSettings } from './animation';

/**
/* @summary makes sure target adapts to current screen size accordingly
/* TODO: specific adaptations to mobile screens.
**/
const _limitTargetSize = (target) => {
  const targetSize = target;
  if (!Meteor.Device.isPhone()) {
    if (targetSize.width > 300) {
      targetSize.width = 300;
    }
    if (targetSize.height < 390 && targetSize.height > 300) {
      targetSize.height = 390;
    }
  }
  return targetSize;
};

/**
/* @summary draw the cursor either top or down pointing towards the source.
**/
const _cursorPosition = (popup) => {
  // pointer
  if (popup.pointerClass === popup.pointerUp) {
    $(popup.pointerClass).css({ left: popup.pointerPosition, opacity: 1 });
    $(popup.pointerDown).css({ opacity: 0 });
  } else {
    $(popup.pointerClass).css({ left: popup.pointerPosition, opacity: 1 });
    $(popup.pointerUp).css({ opacity: 0 });
  }
};

/**
/* @param {string} source - the source element used to relatively position the popup
/* @param {string} target - the expected dimensions the popup will have according to its content
/* @param {Popup} pop - popup object being used
*/
const _positionCard = (element, target, pop) => {
  let left = Number();
  let pointer = Number();
  const popup = pop;
  const source = element.getBoundingClientRect();
  const spaceRight = parseInt(document.body.offsetWidth - source.right, 10);
  const spaceLeft = parseInt(source.left, 10);
  const documentHalf = parseInt(document.body.offsetWidth / 2, 10);

  // y axis
  if (source.top < parseInt(target.height + 60, 10)) {
    // popup goes at bottom of target
    popup.position.top = source.top;
    $(popup.cardId).css('margin-top', '0px');
    $(popup.pointerUp).css('margin-top', parseInt(source.height, 10));
    popup.pointerClass = popup.pointerUp;
  } else {
    // popup goes on top of target
    popup.position.top = parseInt(source.bottom - target.height, 10);
    $(popup.cardId).css('margin-top', parseInt(0 - source.height - 10, 10));
    $(popup.pointerUp).css('margin-top', '0px');
    popup.pointerClass = popup.pointerDown;
  }

  // x axis
  if (source.left > documentHalf) {
    // popup will be on right side of screen
    if (spaceRight < (target.width - (target.width / 2))) {
      // not enough space on the right for Popup centering
      left = parseInt((source.left - target.width) + source.width, 10);
      pointer = parseInt((target.width - (source.width / 2)) - 12, 10);
    } else {
      // enough space on the right, popup is centered.
      left = parseInt((source.left - (target.width / 2)) + (source.width / 2), 10);
      pointer = parseInt((target.width - (target.width / 2)) - 10, 10);
    }
  // popup will be on left side of screen
  } else if (spaceLeft < (target.width - (target.width / 2))) {
    // not enough space on left
    left = parseInt(source.left, 10);
    pointer = parseInt((source.width / 2) - 12, 10);
  } else {
    // enough space on left;
    left = parseInt((source.left - (target.width / 2)) + (source.width / 2), 10);
    pointer = parseInt((target.width - (target.width / 2)) - 10, 10);
  }

  popup.position.left = left;
  popup.pointerPosition = pointer;

  _cursorPosition(popup);

  return Object.assign(popup.position, target);
};

const _getTargetDimensions = (popup) => {
  const target = {
    width: parseInt($(popup.div).width(), 10),
    height: parseInt($(popup.cardId).height(), 10),
    opacity: 1,
  };
  return _limitTargetSize(target);
};

const _visiblePopup = (id, enabled) => {
  const updatePopup = Session.get(id);
  updatePopup.visible = enabled;
  Session.set(id, updatePopup);

  // remove from index
  if (enabled === false) {
    const list = Session.get('popupList');
    for (let i = 0; i < list.length; i += 1) {
      if (list[i] === id) {
        list.splice(i, 1);
        break;
      }
    }
    Session.set('popupList', list);
  }
};

/**
/* @summary cancels the imminent display of the popup
**/
const _cancel = (id) => {
  if (Session.get(id)) {
    Meteor.clearTimeout(Session.get(id).popupTimer);
  }
};

/**
/* @summary animate fade in or out of popup instance
/* @param {boolean} display - if a fade in or fade out will be played
/* @param {id} string popup identifier
***/
const _animate = (display, id) => {
  const divId = `#${id}`;
  const popup = Session.get(id); // _get(Session.get('popupList'), id);
  if (display) {
    _visiblePopup(id, true);
    if (!Meteor.Device.isPhone()) {
      let pointerFX = '-5px';
      if (popup.pointerClass === popup.pointerUp) { pointerFX = '5px'; }
      $(divId).css('margin-top', pointerFX);
      $(divId).velocity({ marginTop: '0px' }, {
        duration: (animationSettings.duration / 2),
      });
    }
    $(divId).css('opacity', '0');
    $(divId).velocity({ opacity: 1 }, { duration: (animationSettings.duration / 2) });
  } else {
    $(divId).css('opacity', '1');
    $(divId).velocity({ opacity: 0 }, {
      duration: (animationSettings.duration / 2),
      complete: () => {
        $(divId).css('margin-top', '-10000px');
        _visiblePopup(id, false);
        _cancel(id);
        if (Session.get('logger')) {
          Session.set('logger', false);
        }
      },
    });
  }
};

/**
/* @summary fundamental window refreshing events
**/
const _eventHandler = () => {
  // resize
  $(window).resize(() => {
    let popup;
    for (const i in Session.get('popupList')) {
      popup = Session.get('popupList')[i];
      if (Session.get(popup).visible) {
        $(Session.get(popup).div).css(
          _positionCard(
            $(Session.get(popup).sourceId)[0],
            _getTargetDimensions(Session.get(popup)),
            Session.get(popup)
          )
        );
      }
    }
  });

  $('.split').on('scroll', () => {
    let popup;
    for (const i in Session.get('popupList')) {
      popup = Session.get('popupList')[i];
      if (Session.get(popup).visible) {
        $(Session.get(popup).div).css(
          _positionCard(
            $(Session.get(popup).sourceId)[0],
            _getTargetDimensions(Session.get(popup)),
            Session.get(popup)
          )
        );
      }
    }
  });

  $(window).mousemove(() => {
    let popup;
    for (const i in Session.get('popupList')) {
      popup = Session.get('popupList')[i];
      if (Session.get(popup).visible && Session.get(popup).template === 'card' && !Session.get('dragging') && $(`${Session.get(popup).div}:hover`).length === 0) {
        _animate(false, popup);
      }
    }
  });
};

const _get = (source, id, key) => {
  if (source !== undefined) {
    for (let i = 0; i < source.length; i += 1) {
      if (source[i].id === id) {
        if (!key) {
          return source[i];
        }
        return source[i][key];
      }
    }
  }
  return undefined;
};

export class Popup {
  /**
  * @summary a popup window
  * @constructor
  * @param {object} element source of popup caller
  * @param {string} template what template to display inside it
  * @param {object} params configuration of the popup
  * @param {stirng} eventType if click or mouseenter trigger caller
  * @param {string} id how to call this popup in DOM
  **/
  constructor(element, template, params, eventType, id) {
    let timer = 0;

    this.visible = false;
    this.position = {};
    this.id = id;

    // jquery
    this.div = `#${this.id}`;
    this.pointerUp = `#pointer-up-${this.id}`;
    this.pointerDown = `#pointer-down-${this.id}`;
    this.cardId = `#card-${this.id}`;
    this.sourceId = `#${element.id}`;

    if (eventType !== 'click') {
      timer = parseInt(animationSettings.duration * 3, 10);
    }

    // draw content based on target content to be used in popup
    this.params = params;
    this.template = template;

    if (!Meteor.Device.isPhone()) {
      this.popupTimer = Meteor.setTimeout(() => {
        // store content and source for resizing Calls
        this.content = template;
        this.element = element;

        // type of event calling, default if left undefined is mouseenter.
        if (eventType === undefined) {
          this.eventType = 'mouseenter';
        } else {
          this.eventType = eventType;
        }

        this.visible = true;

        this.target = _getTargetDimensions(this);
        this.position = _positionCard(element, this.target, this);
        this.renderPopup();
        _animate(true, this.id);
      }, timer);
    } else {
      this.popupTimer = Meteor.setTimeout(() => {
        this.content = template;
        this.element = element;
        this.visible = true;
        this.eventType = 'click';
        const controller = Session.get(this.id);
        controller.position = {
          width: $(this.cardId).width(),
          height: $(this.cardId).height() + 40,
        };
        Session.set(this.id, controller);
        _animate(true, this.id);
      }, animationSettings.duration);
    }
  }

  /**
  /* @summary activates event listeners for proper popup dynamic rendering behaviour
  **/
  renderPopup() {
    // positioning
    $(this.div).css(this.position);
    _eventHandler();
  }

}

/**
* @summary initializes a new popup and includes it in state manager
* @param {object} element source of popup caller
* @param {string} template what template to display inside it
* @param {object} params configuration of the popup
* @param {stirng} eventType if click or mouseenter trigger caller
* @param {string} id how to call this popup in DOM
**/
const _init = (element, template, params, eventType, id) => {
  const popup = new Popup(element, template, params, eventType, id);
  let popupList = [];
  let found = false;

  Session.set(popup.id, popup);

  if (Session.get('popupList')) {
    popupList = Session.get('popupList');
    for (let i = 0; i < popupList.length; i += 1) {
      if (popupList[i] === id) {
        found = true;
        break;
      }
    }
  }
  if (!found) {
    popupList.push(popup.id);
  }

  Session.set('popupList', popupList);
};

/**
* @summary clears all visible popups in screen
**/
const _clear = () => {
  const popupList = Session.get('popupList');
  if (popupList) {
    for (let i = 0; i < popupList.length; i += 1) {
      if (Session.get(popupList[i]).visible) {
        _animate(false, popupList[i]);
      }
    }
  }
};

export const cancelPopup = _cancel;
export const animatePopup = _animate;
export const displayPopup = _init;
export const getPopup = _get;
export const clearPopups = _clear;
