import {default as Modules} from "./_modules";

popupCard = new Object();
popupCard.visible = false;
popupCard.position = new Object;

let _displayPopup = (content, sourceElement) => {

  Session.set('displayPopup', !Session.get('displayPopup'));

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

}


let _positionCard = (sourceElement, target) => {
  var pointerClass = new String;
  var source = sourceElement.getBoundingClientRect();
  var centerPos = (source.width / 2);

  //Y Axis
  if (source.top < parseInt(target.height + 60)) {
    //Place on bottom
    //popupCard.position['margin-top'] = -5;

    //popup goes at bottom of target
    popupCard.position['top'] = source.bottom;
    pointerClass = 'pointer-up';

  } else {
    //Place at top
    //position['margin-top'] = parseInt(source.top + sourceElement.offsetHeight + 10);

    //popup goes on top of target
    popupCard.position['top'] = parseInt(source.top - target.height);
    pointerClass = 'pointer-down';

  }

  //X Axis
  var spaceRight = parseInt(document.body.offsetWidth - source.right);
  var spaceLeft = parseInt(source.left);
  var documentHalf = parseInt(document.body.offsetWidth / 2);

  console.log(sourceElement);
  console.log(source.left);
  console.log('spaceLeft = ' + spaceLeft);

  if (source.left > documentHalf) {
    //popup will be on right side of screen

    if (spaceRight < (target.width - (target.width / 2))) {
      //not enough space on the right for Popup centering
      console.log('not enough space on the right for Popup centering.');
      left = parseInt(source.left - target.width + source.width);
    } else {
      //enough space on the right, Popup is centered.
      console.log('enough space on the right, Popup is centered.');
      left = parseInt(source.left - (target.width / 2) + (source.width / 2));
    }
  } else {
    //popup will be on left side of screen
    if (spaceLeft < (target.width - (target.width / 2))) {
      //not enough space on left
      console.log('not enough space on left');
      left = parseInt(source.left);
    } else {
      //enough space on left;
      console.log('enough space on left');
      left = parseInt(source.left - (target.width / 2) + (source.width / 2));
    }
  }

  popupCard.position['left'] = left;

  //Right side of screen
/*  if (source.left > (document.body.offsetWidth / 2)) {
    if (spaceRight < (target.width - (target.width / 2))) {
      //little space on the right
      var newMargin = (0 - target.width + spaceRight + source.width - 10);
      if (newMargin <= 0) {
        popupCard.position['margin-left'] = newMargin;
      } else {
        popupCard.position['margin-left'] = 0;
      }
      popupCard.cursorLeft = target.width - spaceRight - (source.width / 2) + 5;
    } else {
      //centered
      popupCard.position['margin-left'] = (0 - (target.width / 2) +  (source.width / 2) + 5);
      popupCard.cursorLeft = (target.width / 2) - 10;
    }
  } else {
    //Left side of screen-new-proposal

    //TODO

  }*/

  return Object.assign(popupCard.position, target);
}

let _renderPopup = () => {

  //Pointer
  $('.pointer-up').css({ 'left' : popupCard.cursorLeft });

  //positioning
  $('#popup').css(popupCard.position);

  //Animation
  popupCard.position['easing'] = 'ease-in-out';

  //TODO fix animation for this cmomponent but the line below will break HTML.
  //behave(this.firstNode, 'fade-and-roll', position, animation);

  //Resize
  $(window).resize( function() {
    if (popupCard.visible == true) {
      $('#popup').css(Modules.client.positionCard(popupCard.sourceElement, popupCard.target));
      $('.pointer-up').css({ 'left' : popupCard.cursorLeft });
    }
  });

}

Modules.client.renderPopup = _renderPopup;
Modules.client.positionCard = _positionCard;
Modules.client.displayPopup = _displayPopup;
