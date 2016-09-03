import {default as Modules} from "./_modules";

popupCard = new Object();
popupCard.visible = false;
popupCard.position = new Object;

let _displayPopup = (content, sourceElement, show) => {

  //Store content and source for resizing Calls
  popupCard.content = content;
  popupCard.sourceElement = sourceElement;

  //Draw content
  switch (content) {
  case 'login':
    target = {
      width : 300,
      height: 225,
      opacity: 1
    }
    popupCard.visible = true;
    break;
  default:
    break;
  }
  popupCard.target = target;
  popupCard.position = _positionCard(sourceElement, target);
  _renderPopup();

  if (show == undefined) {
    Session.set('displayPopup', !Session.get('displayPopup'));
  } else {
    Session.set('displayPopup', show);
  }

}


let _positionCard = (sourceElement, target) => {
  var left = new Number();
  var pointer = new Number();
  var source = sourceElement.getBoundingClientRect();
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

let _renderPopup = () => {

  //positioning
  $('#popup').css(popupCard.position);

  //Resize
  $(window).resize( function() {
    if (Session.get('displayPopup')) {
      $('#popup').css(Modules.client.positionCard(popupCard.sourceElement, popupCard.target));
    }
  });

  $('.split').on('scroll', function() {
    if (Session.get('displayPopup')) {
      $('#popup').css(Modules.client.positionCard(popupCard.sourceElement, popupCard.target));
    }
  });

  $(window).mousemove ( function () {
    if (Session.get('displayPopup')) {
      if ($('#popup:hover').length == 0) {
        Session.set('displayPopup', false);
      }
    }
  });

}

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

Modules.client.animatePopup = _animatePopup;
Modules.client.renderPopup = _renderPopup;
Modules.client.positionCard = _positionCard;
Modules.client.displayPopup = _displayPopup;
