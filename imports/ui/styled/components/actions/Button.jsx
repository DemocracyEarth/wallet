import styled from 'styled-components';
import { bool } from 'prop-types';

import { breakpoint, color, font, radius, setSpace, setType, setSize } from '../../utils';

const Button = styled.button`
  ${setSpace('pam')};
  ${setType('x')};
  border-radius: ${radius.s};
  border-style: solid;
  border-width: 1px;
  display: inline-block;
  font-family: ${font.mont};
  font-weight: bold;
  outline: none;
  text-transform: uppercase;

  ${({ primary, inverted }) => {
    if (primary) {
      return `
        background: ${!inverted ? 'transparent' : color.white};
        border-color: ${!inverted ? 'transparent' : color.white};
        color: ${!inverted ? 'transparent' : color.eggplantM};
      `;
    }
    return '';
  }}

  ${({ secondary, inverted }) => {
    if (secondary) {
      return `
        background: ${!inverted ? 'transparent' : 'transparent'};
        border-color: ${!inverted ? 'transparent' : color.flareLLt};
        color: ${!inverted ? 'transparent' : color.white};
      `;
    }
    return '';
  }}

  /* fixed-width */
  ${({ fixed }) => {
    return fixed
      ? `
    ${setSpace('phx')};
    width: 130px;
    ${breakpoint.tablet} {
      width: 160px;
    }
    ${breakpoint.desktop} {
      width: 190px;
    }
  `
      : '';
  }};

  /* block */
  ${({ block }) => {
    return block
      ? `
    display: block;
    margin: 0 auto;
    max-width: 300px;
    width: 100%;
  `
      : '';
  }};

  /* iconic */
  ${({ iconic }) => {
    if (iconic) {
      return `
        ${setSize('m')};
        ${setSpace('pan')};
        border-radius: ${radius.a};
        line-height: 1em;
        text-align: center;
        text-transform: none;
      `;
    }
    return null;
  }}

`;

Button.propTypes = {
  fixed: bool,
  inverted: bool,
  primary: bool,
  secondary: bool,
};

Button.defaultProps = {
  fixed: false,
  inverted: false,
  primary: false,
  secondary: false,
};

export default Button;
