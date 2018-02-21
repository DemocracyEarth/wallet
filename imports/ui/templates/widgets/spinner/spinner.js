import { Template } from 'meteor/templating';

import './spinner.html';

Template.spinner.onRendered(function () {
  const opts = {
    lines: 17,
    length: 6,
    width: 1.5,
    radius: 16,
    scale: 0.4,
    corners: 1,
    color: '#000',
    opacity: 0.3,
    rotate: 0,
    direction: 1,
    speed: 1,
    trail: 60,
    fps: 20,
    zIndex: 2e9,
    className: 'spinner',
    top: '0px',
    left: 'auto',
    shadow: false,
    hwaccel: false,
    position: 'relative',
  };

  Object.assign(opts, this.data);

  const target = document.getElementById(`spinner-feed-${this.data.id}`);
  if (typeof Spinner !== 'undefined') {
    let spinner = new Spinner(opts).spin(target);
  }
});
