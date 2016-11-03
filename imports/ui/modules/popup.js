import {default as Modules} from "./_modules";

popupCard = new Object();
popupCard.visible = false;
popupCard.position = new Object;
var popupTimer;

/*****
/* @param {string} template - the name of the blaze template to be used dynamically on the content of the popup
/* @param {string} element - source element is calling this popup for rankPreferences
/* @param {boolean} show - specifically set to true or false if popcurd needs to be shown or hidden
******/
let _displayPopup = (element, visible, template, params, eventType) => {
  var timer = new Number();

  if (!Session.get('displayPopup')) {

    if (eventType == 'click') {
      timer = 0;
    } else {
      timer = parseInt(Modules.client.animationSettings.duration * 5);
    }

    popupTimer = Meteor.setTimeout(function () {

      //store content and source for resizing Calls
      popupCard.content = template;
      popupCard.element = element;

      //type of event calling, default if left undefined is mouseenter.
      if (eventType == undefined ) {
        popupCard.eventType = 'mouseenter';
      } else {
        popupCard.eventType = eventType;
      }

      //draw content based on target content to be used in popup
      Session.set('popupData', params);
      Session.set('popupTemplate', template);
      var target = {
        width : parseInt($('.popup').width()),
        height: parseInt($('.card').height() + 40),
        opacity: 1
      };
      target = _limitTargetSize(target);
      popupCard.visible = true;
      popupCard.target = target;
      popupCard.position = _positionCard(element, target);
      _renderPopup();

      if (visible == undefined) {
        Session.set('displayPopup', !Session.get('displayPopup'));
      } else {
        Session.set('displayPopup', visible);
      }
    }, timer);
  }

}

/*****
/* cancels the imminent display of the popup
*****/
let _cancelPopup = () => {
  Meteor.clearTimeout(popupTimer);
}

/*****
/* makes sure target adapts to current screen size accordingly
/* TODO: specific adaptations to mobile screens.
*****/
let _limitTargetSize = (target) => {
  if (target.width > 300) { target.width = 300 };
  return target;
}

/*****
/* @param {string} source - the source element used to relatively position the popup
/* @param {string} target - the expected dimensions the popup will have according to its content
******/
let _positionCard = (element, target) => {
  var left = new Number();
  var pointer = new Number();
  var source = element.getBoundingClientRect();
  var spaceRight = parseInt(document.body.offsetWidth - source.right);
  var spaceLeft = parseInt(source.left);
  var documentHalf = parseInt(document.body.offsetWidth / 2);

  //Y Axis
  if (source.top < parseInt(target.height + 60)) {
    //popup goes at bottom of target
    popupCard.position['top'] = source.top;
    $('.card').css('margin-top', '0px');
    $('.pointer-up').css('margin-top', parseInt(source.height));
    popupCard.pointerClass = '.pointer-up';
  } else {
    //popup goes on top of target
    popupCard.position['top'] = parseInt(source.bottom - target.height);
    $('.card').css('margin-top', parseInt(0 - source.height - 10));
    $('.pointer-up').css('margin-top', '0px');
    popupCard.pointerClass = '.pointer-down';
  }

  //X Axis
  if (source.left > documentHalf) {
    //popup will be on right side of screen
    if (spaceRight < (target.width - (target.width / 2))) {
      //not enough space on the right for Popup centering
      left = parseInt(source.left - target.width + source.width);
      pointer = parseInt(target.width - (source.width / 2) - 10);
    } else {
      //enough space on the right, Popup is centered.
      left = parseInt(source.left - (target.width / 2) + (source.width / 2));
      pointer = parseInt(target.width - (target.width / 2) - 10);
    }
  } else {
    //popup will be on left side of screen
    if (spaceLeft < (target.width - (target.width / 2))) {
      //not enough space on left
      left = parseInt(source.left);
      pointer = parseInt((source.width / 2) - 10);
    } else {
      //enough space on left;
      left = parseInt(source.left - (target.width / 2) + (source.width / 2));
      pointer = parseInt(target.width - (target.width / 2) - 10);
    }
  }
  popupCard.position['left'] = left;
  popupCard.pointerPosition = pointer;

  _cursorPosition();

  return Object.assign(popupCard.position, target);
}

/*****
/* activates event listeners for proper popup dynamic rendering behaviour
******/
let _renderPopup = () => {

  //positioning
  $('.popup').css(popupCard.position);

  //Resize
  $(window).resize( function() {
    if (Session.get('displayPopup')) {
      $('.popup').css(_positionCard(popupCard.element, popupCard.target));
    }
  });

  $('.split').on('scroll', function() {
    if (Session.get('displayPopup')) {
      $('.popup').css(_positionCard(popupCard.element, popupCard.target));
    }
  });

  $(window).mousemove ( function () {
    if (Session.get('displayPopup')) {
      if (Session.get('popupTemplate') == 'card') {
        if ($('#popup:hover').length == 0) {
          Session.set('displayPopup', false);
        }
      }
    }
  });
}

/*****
/* @param {boolean} display - if a fade in or fade out will be played
******/
let _animatePopup = (display) => {
  if (display) {
    var pointerFX = '-5px';
    if (popupCard.pointerClass == '.pointer-up') { pointerFX = '5px'; };
    $('.popup').css('opacity','0');
    $('.popup').css('margin-top', pointerFX);
    $('.popup').velocity({ 'opacity' : 1}, {duration: (Modules.client.animationSettings.duration / 2)});
    $('.popup').velocity({ 'marginTop' : '0px'}, {duration: (Modules.client.animationSettings.duration / 2)});
  } else {
    $('.popup').css('opacity','1');
    $('.popup').velocity({ 'opacity' : 0}, {duration: (Modules.client.animationSettings.duration / 2), complete: function () {
        $('.popup').css('margin-top', '-10000px');
        Session.set('displayPopup', false);
      }
    });
  }
}

/*****
/* draw the cursor either top or down pointing towards the source element calling this popup.
******/
let _cursorPosition = () => {
  //pointer
  if (popupCard.pointerClass == '.pointer-up') {
    $(popupCard.pointerClass).css({ 'left' : popupCard.pointerPosition, 'opacity': 1 });
    $('.pointer-down').css({ 'opacity' : 0 });
  } else {
    $(popupCard.pointerClass).css({ 'left' : popupCard.pointerPosition, 'opacity': 1 });
    $('.pointer-up').css({ 'opacity' : 0 });
  }
}

/*****
/* @param {object} target - DOM element that is being used as reference for calling login popup
******/
let _displayLogin = (event, target) => {
  if (target == undefined) { target = event.target };
  Session.set('logger', !Session.get('logger'));
  if (Session.get('logger')) {
    Modules.client.displayPopup(target, Session.get('logger'), 'login', this, event.type);
  } else {
    Modules.client.animatePopup(false);
  }
}

Modules.client.cancelPopup = _cancelPopup;
Modules.client.displayLogin = _displayLogin;
Modules.client.animatePopup = _animatePopup;
Modules.client.displayPopup = _displayPopup;
