import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import './touchmenu.html';

let lastScrollTop = 0;
let scrollDown = false;

function fixMenu() {
  $('#content').scroll(() => {
    console.log('scroll fucker');
    const st = $('.right').scrollTop();
    if (st > lastScrollTop) {
      if (scrollDown === false && st > 150) {
        scrollDown = true;
        $('.mobile-menu').css('position', 'fixed');
        console.log('scrolldownd');
        // animate(node, 'hide-up', { duration: parseInt(timers.ANIMATION_DURATION, 10), easing: 'ease-in' });
      }
    } else if (scrollDown === true) {
      $('.mobile-menu').css('position', 'absolute');
      console.log('scrolleeeep');
      scrollDown = false;
      // animate(node, 'show-down', { duration: parseInt(timers.ANIMATION_DURATION, 10), easing: 'ease-out' });
    }
    lastScrollTop = st;
  });
}

Template.touchmenu.onRendered(() => {
  console.log('menu');
  fixMenu();
});
