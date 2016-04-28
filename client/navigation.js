if (Meteor.isClient) {

  //Scroll behaviour
  var lastScrollTop = 0;
  var scrollDown = false;
  $(window).scroll(function(event) {
    node = $('.navbar');
     var st = $(this).scrollTop();
     if (st > lastScrollTop){
         console.log(st);
         if (scrollDown == false && st > 160) {
           scrollDown = true;
           animate(node, 'hide-up',  { duration : parseInt(ANIMATION_DURATION * 2), easing : "ease-out"  });

         }
     } else {
        console.log('up');
        if (scrollDown == true) {
          scrollDown = false;
          animate(node, 'show-down', { duration : parseInt(ANIMATION_DURATION * 2), easing : "ease-out"});
        }
     }
     lastScrollTop = st;

  });

  Template.navigation.helpers({
    screen: function () {
      switch(Session.get('stage')) {
        case 'draft':
          return TAPi18n.__('screen-new-proposal') + " <strong>" + ORGANIZATION_NAME + "</strong>";
        default:
          return ORGANIZATION_NAME;
      }
    },
    icon: function () {
      return 'images/olive-spaced.png';
    }
  })
}
