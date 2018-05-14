import fluid from '../functions/fluid';

import { sizes } from '../';

export const setHeight = (val) => {
  return fluid(['height'], sizes[val][0], sizes[val][1]);
};
export const setWidth = (val) => {
  return fluid(['width'], sizes[val][0], sizes[val][1]);
};
export const setSize = (val) => {
  return fluid(['width', 'height'], sizes[val][0], sizes[val][1]);
};
