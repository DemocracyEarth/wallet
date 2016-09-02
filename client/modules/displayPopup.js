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
  var left = new Number();
  var pointer = new Number();
  var source = sourceElement.getBoundingClientRect();
  var spaceRight = parseInt(document.body.offsetWidth - source.right);
  var spaceLeft = parseInt(source.left);
  var documentHalf = parseInt(document.body.offsetWidth / 2);

  //Y Axis
  if (source.top < parseInt(target.height + 60)) {
    //popup goes at bottom of target
    popupCard.position['top'] = source.bottom;
    popupCard.pointerClass = '.pointer-up';
  } else {
    //popup goes on top of target
    popupCard.position['top'] = parseInt(source.top - target.height);
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

  return Object.assign(popupCard.position, target);
}

let _renderPopup = () => {

  //Pointer
  if (popupCard.pointerClass == '.pointer-up') {
    $(popupCard.pointerClass).css({ 'left' : popupCard.pointerPosition, 'opacity': 1 });
    $('.pointer-down').css({ 'opacity' : 0 });
  } else {
    $(popupCard.pointerClass).css({ 'left' : popupCard.pointerPosition, 'opacity': 1 });  
    $('.pointer-up').css({ 'opacity' : 0 });
  }


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
