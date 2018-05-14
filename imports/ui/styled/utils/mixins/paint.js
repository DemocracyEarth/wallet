import { darken, lighten } from 'polished';

/* eslint import/prefer-default-export: 0 */
export const paint = (hex, val) => {
  switch (val) {
    case 'Wt':
      return lighten(0.36, hex);
    case 'HL':
      return lighten(0.27, hex);
    case 'Lt':
      return lighten(0.18, hex);
    case 'LLt':
      return lighten(0.09, hex);
    case 'HD':
      return darken(0.09, hex);
    case 'D':
      return darken(0.18, hex);
    case 'LD':
      return darken(0.27, hex);
    case 'Blk':
      return darken(0.36, hex);
    case 'M':
    default:
      return hex;
  }
};
