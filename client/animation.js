if (Meteor.isClient) {

  Template.warning.rendered = function () {
    var main = this.firstNode;

    //Animation states
    var init = {
     'opacity': '0',
     //'margin': '5px 0',
     //'position': 'absolute',
     'overflow': 'hidden',
     'height' : '0px'
    };
    var finish = {
      'opacity': '1',
      'height': '36px'
    };
    var exit = {
      'opacity': '0',
      'height': '0px'
    }

    //Configure UI hooks
    var hooks = {
      insertElement: function(node, next) {
        $(node).css(init);
        $(node).insertBefore(next);
        $(node).velocity(finish, {
          duration: ANIMATION_DURATION,
          //easing: 'ease-in',
          queue: false
        });
        Deps.afterFlush(function() {
          $(node).width();
        });
      },
      removeElement: function(node) {
        $(node)
          .velocity(exit, {
            duration: ANIMATION_DURATION,
            //easing: 'ease-out',
            queue: false,
            complete: function() {
              $(node).remove();
            }
          });
      }
    };

    //Animate object
    if (main.parentNode != null) {
      main.parentNode._uihooks = hooks;
    }

  };

}
