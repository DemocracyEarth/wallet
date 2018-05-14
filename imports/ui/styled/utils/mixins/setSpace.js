import fluid from '../functions/fluid';

import { space } from '../';

/* eslint import/prefer-default-export: 0 */
export const setSpace = (args) => {
  const prop = args.substr(0, 1);
  const pos = args.substr(1, 1);
  const size = args.substr(2, 1);
  const properties = {
    b: 'border',
    m: 'margin',
    p: 'padding',
  };
  const positions = {
    t: 'top',
    b: 'bottom',
    l: 'left',
    r: 'right',
  };
  switch (pos) {
    case 'a':
      return fluid(`${properties[prop]}`, space[size][0], space[size][1]);
    case 'h':
      return fluid([`${properties[prop]}-left`, `${properties[prop]}-right`], space[size][0], space[size][1]);
    case 'v':
      return fluid([`${properties[prop]}-top`, `${properties[prop]}-bottom`], space[size][0], space[size][1]);
    default:
      return fluid(`${properties[prop]}-${positions[pos]}`, space[size][0], space[size][1]);
  }
};
