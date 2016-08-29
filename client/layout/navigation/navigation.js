//Scroll behaviour
var lastScrollTop = 0;
var scrollDown = false;
var displayLogin = false;


if (Meteor.Device.isPhone()) {
  $(window).scroll(function(event) {
    node = $('.navbar');
     var st = $(this).scrollTop();
     if (st > lastScrollTop){
         if (scrollDown == false && st > 150) {
           scrollDown = true;
           animate(node, 'hide-up',  { duration : parseInt(ANIMATION_DURATION * 2.5), easing : "ease-in"  });
         }
     } else {
        if (scrollDown == true) {
          scrollDown = false;
          animate(node, 'show-down', { duration : parseInt(ANIMATION_DURATION * 2.5), easing : "ease-out"});
        }
     }
     lastScrollTop = st;
  });
};

Template.navigation.rendered = function () {
}

Template.navigation.helpers({
  screen: function () {
    if (Session.get('navbar')) {
      return Session.get('navbar').title;
    }
  },
  icon: function () {
    if (Session.get('navbar')) {
      return displayMenuIcon();
    }
  },
  link: function () {
    if (Session.get('navbar')) {
      return Session.get('navbar').href;
    }
  }
});

Template.navigation.events({
  "click #menu": function (event) {
    if (Session.get('navbar').action == 'SIDEBAR') {
      Session.set('sidebar', !Session.get('sidebar'))
    }
  }
})

function displayMenuIcon() {
  if (Session.get('sidebar')) {
    return 'images/burger.png';
  } else {
    return 'images/burger-active.png';
  }
}
