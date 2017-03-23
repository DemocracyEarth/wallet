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
  if (targetSize.width > 300) {
    targetSize.width = 300;
  }
  return targetSize;
};

/**
/* @param {object} target - DOM element that is being used as reference for calling login popup
**/
const _displayLogin = (event, target) => {
  let loginTarget = target;
  if (target === undefined) { loginTarget = event.target; }
  Session.set('logger', !Session.get('logger'));
  if (Session.get('logger')) {
    _displayPopup(loginTarget, Session.get('logger'), 'login', this, event.type);
  } else {
    _animatePopup(false);
  }
};

/**
/* @summary cancels the imminent display of the popup
**/
const _cancel = (id) => {
  const list = Session.get('popupList');
  for (let i = 0; i < list.length; i += 1) {
    if (list[i].id === id) {
      Meteor.clearTimeout(list[i].popupTimer);
      break;
    }
  }
};

const _update = (id, popup) => {
  const list = Session.get('popupList');
  for (let i = 0; i < list.length; i += 1) {
    if (list[i].id === id) {
      list[i] = popup;
    }
  }
  Session.set('popupList', list);
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

/**
/* @summary animate fade in or out of popup instnace
/* @param {boolean} display - if a fade in or fade out will be played
***/
const _animate = (display, id) => {
  const divId = `#${id}`;
  const popup = _get(Session.get('popupList'), id);
  if (display) {
    let pointerFX = '-5px';
    if (popup.pointerClass === popup.pointerUp) { pointerFX = '5px'; }
    $(divId).css('opacity', '0');
    $(divId).css('margin-top', pointerFX);
    $(divId).velocity({ opacity: 1 }, { duration: (animationSettings.duration / 2) });
    $(divId).velocity({ marginTop: '0px' }, { duration: (animationSettings.duration / 2) });
  } else {
    $(divId).css('opacity', '1');
    $(divId).velocity({ opacity: 0 }, {
      duration: (animationSettings.duration / 2),
      complete: () => {
        $(divId).css('margin-top', '-10000px');
        const updatePopup = _get(Session.get('popupList'), id);
        updatePopup.visible = false;
        _update(id, updatePopup);
      },
    });
  }
};

export class Popup {
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

    if (eventType !== 'click') {
      timer = parseInt(animationSettings.duration * 5, 10);
    }

    // draw content based on target content to be used in popup
    this.params = params;
    this.template = template;

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

      let target = {
        width: parseInt($(this.div).width(), 10),
        height: parseInt($(this.cardId).height() + 40, 10),
        opacity: 1,
      };
      target = _limitTargetSize(target);
      this.visible = true;
      this.target = target;
      this.position = this.positionCard(element, target);
      this.renderPopup();

      _animate(true, this.id);
    }, timer);
  }

  /**
  /* @param {string} source - the source element used to relatively position the popup
  /* @param {string} target - the expected dimensions the popup will have according to its content
  */
  positionCard(element, target) {
    let left = Number();
    let pointer = Number();
    const source = element.getBoundingClientRect();
    const spaceRight = parseInt(document.body.offsetWidth - source.right, 10);
    const spaceLeft = parseInt(source.left, 10);
    const documentHalf = parseInt(document.body.offsetWidth / 2, 10);

    // y axis
    if (source.top < parseInt(target.height + 60, 10)) {
      // popup goes at bottom of target
      this.position.top = source.top;
      $(this.cardId).css('margin-top', '0px');
      $(this.pointerUp).css('margin-top', parseInt(source.height, 10));
      this.pointerClass = this.pointerUp;
    } else {
      // popup goes on top of target
      this.position.top = parseInt(source.bottom - target.height, 10);
      $(this.cardId).css('margin-top', parseInt(0 - source.height - 10, 10));
      $(this.pointerUp).css('margin-top', '0px');
      this.pointerClass = this.pointerDown;
    }

    // x axis
    if (source.left > documentHalf) {
      // popup will be on right side of screen
      if (spaceRight < (target.width - (target.width / 2))) {
        // not enough space on the right for Popup centering
        left = parseInt((source.left - target.width) + source.width, 10);
        pointer = parseInt((target.width - (source.width / 2)) - 10, 10);
      } else {
        // enough space on the right, popup is centered.
        left = parseInt((source.left - (target.width / 2)) + (source.width / 2), 10);
        pointer = parseInt((target.width - (target.width / 2)) - 10, 10);
      }
    // popup will be on left side of screen
    } else if (spaceLeft < (target.width - (target.width / 2))) {
      // not enough space on left
      left = parseInt(source.left, 10);
      pointer = parseInt((source.width / 2) - 10, 10);
    } else {
      // enough space on left;
      left = parseInt((source.left - (target.width / 2)) + (source.width / 2), 10);
      pointer = parseInt((target.width - (target.width / 2)) - 10, 10);
    }

    this.position.left = left;
    this.pointerPosition = pointer;

    this.cursorPosition();

    return Object.assign(this.position, target);
  }

  /**
  /* @summary activates event listeners for proper popup dynamic rendering behaviour
  **/
  renderPopup() {
    // positioning
    $(this.div).css(this.position);
    this.loop();
  }

  /**
  /* @summary draw the cursor either top or down pointing towards the source.
  **/
  cursorPosition() {
    // pointer
    if (this.pointerClass === this.pointerUp) {
      $(this.pointerClass).css({ left: this.pointerPosition, opacity: 1 });
      $(this.pointerDown).css({ opacity: 0 });
    } else {
      $(this.pointerClass).css({ left: this.pointerPosition, opacity: 1 });
      $(this.pointerUp).css({ opacity: 0 });
    }
  }

  /**
  /* @summary fundamental window refreshing events
  **/
  // TODO: remove this from class, make it general purpose?
  loop() {
    // resize
    $(window).resize(() => {
      if (this.visible) {
        console.log('resize');
        $(this.div).css(this.positionCard(this.element, this.target));
      }
    });

    $('.split').on('scroll', () => {
      if (this.visible) {
        console.log('scroll');
        $(this.div).css(this.positionCard(this.element, this.target));
      }
    });

    $(window).mousemove(() => {
      if (this.visible) {
        if (this.template === 'card' && !Session.get('dragging')) {
          console.log('mousemove');
          if ($(`${this.div}:hover`).length === 0) {
            this.visible = false;
          }
        }
      }
    });
  }

}

const _init = (element, template, params, eventType, id) => {
  const popup = new Popup(element, template, params, eventType, id);
  let popupList = [];
  let found = false;

  if (Session.get('popupList')) {
    popupList = Session.get('popupList');
    for (let i = 0; i < popupList.length; i += 1) {
      if (popupList[i].id === id) {
        popupList[i] = popup;
        found = true;
        break;
      }
    }
  }
  if (!found) {
    popupList.push(popup);
  }

  Session.set('popupList', popupList);
};


export const cancelPopup = _cancel;
export const displayLogin = _displayLogin;
export const animatePopup = _animate;
export const displayPopup = _init;
export const updatePopup = _update;
export const getPopup = _get;
