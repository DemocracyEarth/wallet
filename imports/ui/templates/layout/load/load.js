import { Template } from 'meteor/templating';

import './load.html';

Template.load.onRendered(() => {
  const opts = {
    lines: 17, // The number of lines to draw
    length: 13, // The length of each line
    width: 3, // The line thickness
    radius: 32, // The radius of the inner circle
    scale: 0.75, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#000', // #rgb or #rrggbb or array of colors
    opacity: 0.3, // Opacity of the lines
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
    zIndex: 9996, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '100px', // Top position relative to parent
    left: 'auto', // Left position relative to parent
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    position: 'relative', // Element positioning
  };

  const target = document.getElementById('spinner');
  if (typeof Spinner !== 'undefined') {
    let spinner = new Spinner(opts).spin(target);
  }
});
