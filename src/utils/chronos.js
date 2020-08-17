import i18n from 'i18n';

const buildSentence = (seconds, mode, micro) => {
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return `${interval} ${i18n.t(`years-${mode}${micro ? '-micro' : ''}`)}`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} ${i18n.t(`months-${mode}${micro ? '-micro' : ''}`)}`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} ${i18n.t(`days-${mode}${micro ? '-micro' : ''}`)}`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} ${i18n.t(`hours-${mode}${micro ? '-micro' : ''}`)}`;
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} ${i18n.t(`minutes-${mode}${micro ? '-micro' : ''}`)}`;
  }
  if (seconds === 0) {
    return i18n.t('now');
  }
  return `${Math.floor(seconds)} ${i18n.t(`seconds-${mode}${micro ? '-micro' : ''}`)}`;
};

const _timeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  return buildSentence(seconds, 'ago');
};

const _timeCompressed = (date, micro) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  return buildSentence(seconds, 'compressed', micro);
};

const _timeDateOnly = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return `${date.toLocaleDateString('en', options)}`;
};

const _hourOnly = (date) => {
  return `${(date.getHours() < 10) ? `0${(date.getHours())}` : date.getHours()}:${(date.getMinutes() < 10) ? `0${(date.getMinutes())}` : date.getMinutes()}`;
};

const _timeComplete = (date) => {
  return `${_timeAgo(date)} &#183; ${_timeDateOnly(date)} &#183; ${_hourOnly(date)}`;
};

const timeLeft = (date) => {
  const seconds = Math.floor((date - new Date()) / 1000);
  if (seconds > 0) {
    return buildSentence(seconds, 'left');
  }
  return false;
};

/**
* @summary creates string of date for URL
* @return {string} uri
*/
const _createDateQuery = (date) => {
  return `${date.getFullYear()}-${(date.getMonth() < 9) ? `0${parseInt(date.getMonth() + 1, 10)}` : parseInt(date.getMonth() + 1, 10)}-${(date.getDate() < 10) ? `0${date.getDate()}` : date.getDate()}`;
};

export const hourOnly = _hourOnly;
export const timeDateOnly = _timeDateOnly;
export const timeCompressed = _timeCompressed;
export const timeSince = _timeAgo;
export const timeComplete = _timeComplete;
export const countdown = timeLeft;
export const createDateQuery = _createDateQuery;