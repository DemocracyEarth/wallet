import styled from 'styled-components';
import { bool, string } from 'prop-types';

import { color, setSpace } from '../../utils';

const Separator = styled.hr`
  ${setSpace('pan')};
  border-style: solid;
  ${(props) => {
    return props.dir === 'v'
      ? `
      ${setSpace(`mh${props.size}`)};
      ${setSpace('mvn')};
      border-color: ${props.silent ? 'transparent' : color.greyHL};
      border-width: 0 0 0 1px;
      display: inline-block;
      height: 1em;
      vertical-align: text-top;
      transform: translateY(9%);
  `
      : `
      ${setSpace('mhn')}
      ${setSpace(`mv${props.size}`)};
      border-color: ${props.silent ? 'transparent' : color.greyHL};
      border-width: 1px 0 0;
      border-width: 1px 0 0;
      display: block;
      width: 100%;
  `;
  }};
`;

Separator.propTypes = {
  dir: string,
  size: string,
  silent: bool,
};

Separator.defaultProps = {
  dir: 'h',
  size: 'm',
  silent: false,
};

export default Separator;
