//Scroll behaviour
var lastScrollTop = 0;
var scrollDown = false;

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
      document.title = TAPi18n.__('democracy-of') + ' ' + Meteor.settings.public.Collective.name + ' - ' + Session.get('navbar').title;
      return Session.get('navbar').title;
    } else {
      document.title = TAPi18n.__('democracy-earth');
    }
  },
  icon: function () {
    if (Session.get('navbar') != undefined) {
      return displayMenuIcon();
    } else {
      return 'images/burger.png';
    }
  },
  link: function () {
    if (Session.get('navbar')) {
      return Session.get('navbar').href;
    }
  },
  showNotice: function () {
    return Session.get('showNotice');
  }
});

Template.navigation.events({
  "click #menu": function (event) {
    if (Session.get('navbar').action == 'SIDEBAR') {
      Modules.client.toggleSidebar();
    }
  }
})

function displayMenuIcon() {
  if (Session.get('sidebar')) {
    return 'images/burger-active.png';
  } else {
    return 'images/burger.png';
  }
}
