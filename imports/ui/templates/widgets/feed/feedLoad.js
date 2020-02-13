import { Template } from 'meteor/templating';

import './feedLoad.html';

Template.feedLoad.onRendered(function () {
  const opts = {
    lines: 17,
    length: 13,
    width: 3,
    radius: 32,
    scale: 0.4,
    corners: 1,
    color: '#000',
    opacity: 0.3,
    rotate: 0,
    direction: 1,
    speed: 1,
    trail: 60,
    fps: 20,
    zIndex: 9996,
    className: 'spinner',
    top: '40px',
    left: 'auto',
    shadow: false,
    hwaccel: false,
    position: 'relative',
  };

  const target = document.getElementById('spinner-feed');
  if (typeof Spinner !== 'undefined') {
    let spinner = new Spinner(opts).spin(target);
  }
});
