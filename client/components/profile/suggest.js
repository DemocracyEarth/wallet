Template.suggest.rendered = function () {
  //behave(this.firstNode, 'fade-and-roll', { 'height': '110px' });

  //Hook
  var animation = {
    insertElement: function(node, next) {
      $(node).addClass(OFFSCREEN_CLASS);
      $(node).css({'opacity':  '0px', 'height' : '0px'});
      $(node).insertBefore(next);
      $(node).velocity({'opacity': '1', 'height' : '110px'}, {
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
  behave(this.firstNode, 'fade-and-roll',  { 'height': '110px' }, animation);

}

Template.suggest.helpers({
  country: function () {
    return Session.get('filteredCountries');
  }
})
