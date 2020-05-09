import { TAPi18n } from 'meteor/tap:i18n';

const buildSentence = (seconds, mode, micro) => {
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return `${interval} ${TAPi18n.__(`years-${mode}${micro ? '-micro' : ''}`)}`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} ${TAPi18n.__(`months-${mode}${micro ? '-micro' : ''}`)}`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} ${TAPi18n.__(`days-${mode}${micro ? '-micro' : ''}`)}`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} ${TAPi18n.__(`hours-${mode}${micro ? '-micro' : ''}`)}`;
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} ${TAPi18n.__(`minutes-${mode}${micro ? '-micro' : ''}`)}`;
  }
  if (seconds === 0) {
    return TAPi18n.__('now');
  }
  return `${Math.floor(seconds)} ${TAPi18n.__(`seconds-${mode}${micro ? '-micro' : ''}`)}`;
};

const _timeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  return buildSentence(seconds, 'ago');
};

const _timeCompressed = (date, micro) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  return buildSentence(seconds, 'compressed', micro);
};

const _timeComplete = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return `${_timeAgo(date)} &#183; ${date.toLocaleDateString('en', options)} &#183; ${(date.getHours() < 10) ? `0${(date.getHours())}` : date.getHours()}:${(date.getMinutes() < 10) ? `0${(date.getMinutes())}` : date.getMinutes()}`;
};

const timeLeft = (date) => {
  const seconds = Math.floor((date - new Date()) / 1000);
  if (seconds > 0) {
    return buildSentence(seconds, 'left');
  }
  return false;
};

export const timeCompressed = _timeCompressed;
export const timeSince = _timeAgo;
export const timeComplete = _timeComplete;
export const countdown = timeLeft;
