import { darken, lighten } from 'polished';

export const colors = {
  black: '#1C1C1C',
  white: '#fff',

  eggplantWt: lighten(0.22, '#33263d'),
  eggplantHL: lighten(0.165, '#33263d'),
  eggplantLt: lighten(0.11, '#33263d'),
  eggplantLLt: lighten(0.055, '#33263d'),
  eggplantM: '#33263d',
  eggplantHD: darken(0.055, '#33263d'),
  eggplantD: darken(0.11, '#33263d'),
  eggplantLD: darken(0.165, '#33263d'),
  eggplantBlk: darken(0.22, '#33263d'),

  flareWt: 'rgba(255,255,255,.07)',
  flareHL: 'rgba(255,255,255,.17375)',
  flareLt: 'rgba(255,255,255,.2775)',
  flareLLt: 'rgba(255,255,255,.38125)',
  flareM: 'rgba(255,255,255,.485)',
  flareHD: 'rgba(255,255,255,.58875)',
  flareD: 'rgba(255,255,255,.6925)',
  flareLD: 'rgba(255,255,255,.79625)',
  flareBlk: 'rgba(255,255,255,.9)',

  shadowWt: 'rgba(0,0,0,.07)',
  shadowHL: 'rgba(0,0,0,.17375)', // 0,07+((0,83/8)*1)
  shadowLt: 'rgba(0,0,0,.2775)',
  shadowLLt: 'rgba(0,0,0,.38125)',
  shadowM: 'rgba(0,0,0,.485)',
  shadowHD: 'rgba(0,0,0,.58875)',
  shadowD: 'rgba(0,0,0,.6925)',
  shadowLD: 'rgba(0,0,0,.79625)',
  shadowBlk: 'rgba(0,0,0,.9)',
};

export const color = colors;
