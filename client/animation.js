if (Meteor.isClient) {

  Template.warning.rendered = function () {
    var main = this.firstNode;

    //Animation states
    var init = {
     'opacity': '0',
     'overflow': 'hidden',
     'height' : '0px'
    };
    var finish = {
      'opacity': 1,
      'height': '35px'
    };

    //Configure UI hooks
    var hooks = {
      insertElement: function(node, next) {
        $(node).css(init);
        $(node).insertBefore(next);
        $(node).velocity(finish, ANIMATION_DURATION);

        Deps.afterFlush(function() {
          $(node).width();
        });
      },
      removeElement: function(node) {
        console.log('REMOVE: ' + node);
        var item = $(node);
        $(node)
          .velocity({translateX: 20}, {
            duration: ANIMATION_DURATION,
            easing: 'ease-in-out',
            queue: false,
            complete: function() {
              $(node).remove();
            }
          });
      }
    }

    //Animate object
    if (main.parentNode != null) {
      main.parentNode._uihooks = hooks;
    }

  };

}
