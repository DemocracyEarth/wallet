//**********
//Calls
//**********

//Does specific animation
animate = function (node, animation, params) {
  var main = node;
  var standard = {
    duration: ANIMATION_DURATION,
    loop: false
  };
  var settings = Object.assign(standard, params)
  switch(animation) {
  case 'color-activate':
    node
      .velocity("stop")
      .velocity({'backgroundColor': '#ccc'}, settings)
      .velocity({'backgroundColor': '#00bf8f'}, settings)
      .velocity("stop");
    break;
  case 'color-deactivate':
      node
        .velocity("stop")
        .velocity({'backgroundColor': '#00bf8f'}, settings)
        .velocity({'backgroundColor': '#ccc'}, settings)
        .velocity("stop");
      break;
  case 'slide-right':
    node
      .velocity("stop")
      .velocity({'margin-left': '2px'}, settings)
      .velocity({'margin-left': '42px'}, settings)
      .velocity("stop");
    break;
  case 'slide-left':
    node
      .velocity("stop")
      .velocity({'margin-left': '42px'}, settings)
      .velocity({'margin-left': '2px'}, settings)
      .velocity("stop");
    break;
  case 'fade-in':
    node
      .velocity("stop")
      .velocity({'opacity': '0'}, settings)
      .velocity({'opacity': '1'}, settings)
      .velocity("stop");
    break;
  case 'tilt':
    node
      .velocity({'opacity': '0'}, settings)
      .velocity("reverse");
    break;
  }
}

//Attaches animation to reactive behaviour
behave = function (node, animation, params) {
  var main = node;
  var standard = {
    duration: ANIMATION_DURATION,
    loop: false
  };
  var settings = Object.assign(standard, params);
  if (main.parentNode != null) {
    if (main.parentNode._uihooks == undefined) {
      switch (animation) {
      case 'fade':
        main.parentNode._uihooks = fadeTag;
        fadeIn(main, main.nextSibling);
        break;
      case 'fade-and-roll':
        if (params != undefined) {
          aniFinish['height'] = settings['height'];
        }
        main.parentNode._uihooks = fadeLabel;
        fadeInRolldown(main, main.nextSibling);
        break;
      default:
      }
    }
  }
}

//**********
//UI Hooks
//**********

fadeLabel = {
  insertElement: function(node, next) {
    fadeInRolldown(node,next);
    Deps.afterFlush(function() {
      $(node).width();
      $(node).removeClass(OFFSCREEN_CLASS);
    });
  },
  moveElement: function(node, next) {
    fadeLabel.removeElement(node);
    fadeLabel.insertElement(node, next);
  },
  removeElement: function(node) {
    fadeOutRollup(node);
  }
};

fadeTag = {
  insertElement: function(node, next) {
    fadeIn(node,next);
    Deps.afterFlush(function() {
      $(node).width();
      $(node).removeClass(OFFSCREEN_CLASS);
    });
  },
  moveElement: function(node, next) {
    fadeTag.removeElement(node);
    fadeTag.insertElement(node, next);
  },
  removeElement: function(node) {
    fadeOut(node);
  }
};

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

function fadeIn(node, next) {
  $(node).addClass(OFFSCREEN_CLASS);
  $(node).css('opacity: 0px');
  $(node).insertBefore(next);
  $(node).velocity({'opacity': '1'}, {
    duration: ANIMATION_DURATION,
    queue: false
  });
}

function fadeOut(node) {
  $(node)
    .velocity({'opacity': '0'}, {
      duration: ANIMATION_DURATION,
      queue: false,
      complete: function() {
        $(node).remove();
      }
    });
}
