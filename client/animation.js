if (Meteor.isClient) {

  //sample declaration for reference
  Template.warning.rendered = function () {
    animate(this.firstNode, 'fade-and-roll', { 'height': '36px' });
  };

}


//**********
//UI Hooks
//**********

fadeLabel = {
  insertElement: function(node, next) {
    console.log('[animation] insertElement');
    fadeInRolldown(node,next);
    Deps.afterFlush(function() {
      $(node).width();
      $(node).removeClass(OFFSCREEN_CLASS);
    });
  },
  moveElement: function(node, next) {
    console.log('[animation] moveElement');
    fadeLabel.removeElement(node);
    fadeLabel.insertElement(node, next);
  },
  removeElement: function(node) {
    console.log('[animation] removeElement');
    fadeOutRollup(node);
  }
};

animate = function (node, animation, params) {
  var main = node;
  switch(animation) {
  case 'tilt':
    node
      .velocity({'opacity': '0'}, ANIMATION_DURATION)
      .velocity("reverse");
    break;
  case 'fade-and-roll':
  default:
    if (main.parentNode != null) {
      if (main.parentNode._uihooks == undefined) {
        if (params != undefined) {
          aniFinish['height'] = params['height'];
        }
        main.parentNode._uihooks = fadeLabel;
        fadeInRolldown(main, main.nextSibling);
        break;
      }
    }
  }
}

//**********
//States
//**********

var aniInitial = {
 'opacity': '0',
 'overflow': 'hidden',
 'height' : '0px'
};
var aniFinish = {
  'opacity': '1',
  'height': '36px'
};
var aniExit = {
  'opacity': '0',
  'height': '0px'
}
var OFFSCREEN_CLASS = 'off-screen';


//**********
//Animations
//**********

function fadeInRolldown(node, next) {
  $(node).addClass(OFFSCREEN_CLASS);
  $(node).css(aniInitial);
  $(node).insertBefore(next);
  $(node).velocity(aniFinish, {
    duration: ANIMATION_DURATION,
    queue: false
  });
}

function fadeOutRollup(node) {
  $(node)
    .velocity(aniExit, {
      duration: ANIMATION_DURATION,
      queue: false,
      complete: function() {
        $(node).remove();
      }
    });
}
