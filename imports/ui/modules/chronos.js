import {default as Modules} from "./_modules";

let timeAgo = (date) => {
    var seconds = Math.floor((new Date() - date) / 1000);
    return buildSentence(seconds, 'ago');
}

let timeLeft = (date) => {
  var seconds = Math.floor((date - new Date()) / 1000);
  if (seconds > 0) {
    return buildSentence(seconds, 'left');
  } else {
    return false;
  }
}

let buildSentence = (seconds, mode) => {
  var interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
      return interval + " " + TAPi18n.__('years-' + mode);
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
      return interval + " " + TAPi18n.__('months-' + mode);
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
      return interval + " " + TAPi18n.__('days-' + mode);;
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
      return interval + " " + TAPi18n.__('hours-' + mode);
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
      return interval + " " + TAPi18n.__('minutes-' + mode);
  }
  return Math.floor(seconds) + " " + TAPi18n.__('seconds-' + mode);
}

Modules.client.timeSince = timeAgo;
Modules.client.countdown = timeLeft;
