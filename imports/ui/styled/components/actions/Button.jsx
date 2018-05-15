import styled from 'styled-components';
import { bool } from 'prop-types';

import { breakpoint, color, font, radius, setSpace, setType } from '../../utils';

const Button = styled.button`
  ${setSpace('pam')};
  ${setType('x')};
  border-radius: ${radius.s};
  border-style: solid;
  border-width: 1px;
  font-family: ${font.mont};
  font-weight: bold;
  text-transform: uppercase;
  outline: none;

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
