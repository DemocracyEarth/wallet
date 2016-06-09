Template.suggest.rendered = function () {

  Session.set('noMatchFound', false);

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
  behave(this.firstNode, 'fade-and-roll',  {}, animation);

}

Template.suggest.helpers({
  country: function () {
    if (Session.get('filteredCountries').length == 0) {
      Session.set('noMatchFound', true);
      return [{
          "code": "EA",
          "emoji": "🌎",
          "name": "Earth"
      }];
    } else {
      Session.set('noMatchFound', false);
      return Session.get('filteredCountries');
    }
  },
  noMatchFound: function () {
    return Session.get('noMatchFound');
  }
})

Template.suggest.events({
  "click #country": function (event) {
    var data = Meteor.user().profile;
    var country = {
      code: event.target.parentNode.getAttribute('value'),
      name: event.target.innerText.slice(4)
    }
    if (country.name == 'arth') { country.name = 'Earth' };
    Session.set('newCountry', country);
    Session.set('noMatchFound', false);
    Session.set('showNations', false);
  }
})
