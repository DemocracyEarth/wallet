if (Meteor.isClient) {

  var position = new Object;
  var pointerClass = new String;
  var target = new Object;
  var cursorLeft;
  var popupVisible = false;
  var popupCard = new Object();

  Template.popup.rendered = function () {

    //Pointer
    $('.pointer-up').css({ 'left' : cursorLeft });

    //positioning
    $('#popup').css(position);

    //Hook
    animation = {
      insertElement: function(node, next) {
        $(node).addClass(OFFSCREEN_CLASS);
        $(node).css({'opacity':  '0px', 'height' : '0px'});
        $(node).insertBefore(next);
        $(node).velocity({'opacity': '1'}, {
          duration: ANIMATION_DURATION,
          queue: false
        });
        Deps.afterFlush(function() {
          $(node).width();
        });
      },
      moveElement: function(node, next) {
        animation.removeElement(node);
        animation.insertElement(node, next);
      },
      removeElement: function(node) {
        $(node)
          .velocity({
            'opacity': '0',
            'height': '0px'
          }, {
            duration: ANIMATION_DURATION,
            queue: false,
            complete: function() {
              $(node).remove();
            }
          });
      }
    };

    //Animation
    position['easing'] = 'ease-in-out';
    behave(this.firstNode, 'fade-and-roll', position, animation);

    //Resize
    $(window).resize( function() {
      if (popupVisible == true) {
        $('#popup').css(positionCard(popupCard.sourceElement, target));
        $('.pointer-up').css({ 'left' : cursorLeft });
      }
    });


  }

  Template.popup.helpers({
    pointer: function () {

    },
    displayDown: function () {

    }
  })

}


displayPopup = function (content, sourceElement) {

  //Store content and source for resizing Calls
  popupCard.content = content;
  popupCard.sourceElement = sourceElement;

  //Draw content
  switch (content) {
  case 'login':
    target = {
      width : 270,
      height: 325,
      opacity: 1
    }
    popupVisible = true;
    break;
  default:
    break;
  }

  position = positionCard(sourceElement, target);

}

function positionCard (sourceElement, target) {
  var pointerClass = new String;
  var source = sourceElement.getBoundingClientRect();
  var centerPos = (source.width / 2);

  //Decide positioning

  //Y Axis
  if (source.top < parseInt(target.height + 60)) {
    //Place on bottom
    position['margin-top'] = -5;
    pointerClass = 'pointer-up';
  } else {
    //Place at top
    //position['margin-top'] = parseInt(source.top + sourceElement.offsetHeight + 10);
    pointerClass = 'pointer-down';
  }

  //X Axis
  var spaceRight = parseInt(document.body.offsetWidth - source.right);
  var spaceLeft = parseInt(document.body.offsetWidth - source.left);

  //Right side of screen
  if (source.left > (document.body.offsetWidth / 2)) {
    if (spaceRight < (target.width - (target.width / 2))) {
      //little space on the right
      var newMargin = (0 - target.width + spaceRight + source.width - 10);
      if (newMargin <= 0) {
        position['margin-left'] = newMargin;
      } else {
        position['margin-left'] = 0;
      }
      cursorLeft = target.width - spaceRight - (source.width / 2) + 5;
    } else {
      //centered
      position['margin-left'] = (0 - (target.width / 2) +  (source.width / 2) + 5);
      cursorLeft = (target.width / 2) - 10;
    }
  } else {
    //Left side of screen-new-proposal

    //TODO

  }


  return Object.assign(position, target);
}
