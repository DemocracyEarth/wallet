import { darken, lighten } from 'polished';

export const colors = {
  black: '#1C1C1C',
  white: '#fff',

  redWt: lighten(0.22, '#c54747'),
  redHL: lighten(0.165, '#c54747'),
  redLt: lighten(0.11, '#c54747'),
  redLLt: lighten(0.055, '#c54747'),
  redM: '#c54747',
  redHD: darken(0.055, '#c54747'),
  redD: darken(0.11, '#c54747'),
  redLD: darken(0.165, '#c54747'),
  redBlk: darken(0.22, '#c54747'),

  greenWt: lighten(0.22, '#2ca25e'),
  greenHL: lighten(0.165, '#2ca25e'),
  greenLt: lighten(0.11, '#2ca25e'),
  greenLLt: lighten(0.055, '#2ca25e'),
  greenM: '#2ca25e',
  greenHD: darken(0.055, '#2ca25e'),
  greenD: darken(0.11, '#2ca25e'),
  greenLD: darken(0.165, '#2ca25e'),
  greenBlk: darken(0.22, '#2ca25e'),

  blueWt: lighten(0.22, '#495bbd'),
  blueHL: lighten(0.165, '#495bbd'),
  blueLt: lighten(0.11, '#495bbd'),
  blueLLt: lighten(0.055, '#495bbd'),
  blueM: '#495bbd',
  blueHD: darken(0.055, '#495bbd'),
  blueD: darken(0.11, '#495bbd'),
  blueLD: darken(0.165, '#495bbd'),
  blueBlk: darken(0.22, '#495bbd'),

  greyWt: lighten(0.22, '#bfbfbf'),
  greyHL: lighten(0.165, '#bfbfbf'),
  greyLt: lighten(0.11, '#bfbfbf'),
  greyLLt: lighten(0.055, '#bfbfbf'),
  greyM: '#bfbfbf',
  greyHD: darken(0.055, '#bfbfbf'),
  greyD: darken(0.11, '#bfbfbf'),
  greyLD: darken(0.165, '#bfbfbf'),
  greyBlk: darken(0.22, '#bfbfbf'),

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
