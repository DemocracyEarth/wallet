import styled from 'styled-components';
import { arrayOf, bool, number, oneOfType, string } from 'prop-types';

import { setSpace } from '../../utils';

const Container = styled.div`
  position: relative;
  ${({ spaced }) => {
    return spaced
      ? `
    ${setSpace('pam')};
  `
      : '';
  }};
  ${({ dir }) => {
    return dir !== null
      ? `
    align-items: center;
    display: flex;
    flex-direction: ${dir};
    justify-content: center;
  `
      : '';
  }};
  ${({ flex }) => {
    return flex !== null
      ? `
    flex: ${flex[0]} ${flex[1]} ${flex[2]};
  `
      : '';
  }};
  ${({ align }) => {
    return align !== null
      ? `
    text-align: ${align};
  `
      : '';
  }};
  ${({ cover }) => {
    return cover
      ? `
    min-height: 100vh;
  `
      : '';
  }};
`;

Container.propTypes = {
  align: string,
  flex: arrayOf(oneOfType([number, string])),
  cover: bool,
  dir: string,
  spaced: bool,
};

Container.defaultProps = {
  align: null,
  flex: null,
  cover: null,
  dir: null,
  spaced: null,
};

export default Container;
