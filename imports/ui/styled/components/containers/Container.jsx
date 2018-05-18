import styled from 'styled-components';
import { arrayOf, bool, number, oneOfType, string } from 'prop-types';

import { breakpoint, setSpace } from '../../utils';

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

  ${({ limit }) => {
    if (limit === 'x') {
      return `
        margin-left: auto;
        margin-right: auto;
        max-width: 400px;
        ${breakpoint.tablet} {
          margin-left: auto;
          margin-right: auto;
          max-width: 480px;
        }
        ${breakpoint.desktop} {
          max-width: 560px;
        }
        ${breakpoint.hdesktop} {
          max-width: 640px;
        }
        `;
    } else if (limit === 's') {
      return `
        ${breakpoint.tablet} {
          margin-left: auto;
          margin-right: auto;
          max-width: 500px;
        }
        ${breakpoint.desktop} {
          max-width: 580px;
        }
        ${breakpoint.hdesktop} {
          max-width: 660px;
        }
        `;
    } else if (limit === 'm') {
      return `
        ${breakpoint.tablet} {
          margin-left: auto;
          margin-right: auto;
          max-width: 600px;
        }
        ${breakpoint.desktop} {
          max-width: 800px;
        }
        ${breakpoint.hdesktop} {
          max-width: 1000px;
        }
      `;
    } else if (limit === 'l') {
      return `
        ${breakpoint.tablet} {
          margin-left: auto;
          margin-right: auto;
          max-width: 768px;
        }
        ${breakpoint.desktop} {
          max-width: 1024px;
        }
        ${breakpoint.hdesktop} {
          max-width: 1200px;
        }
      `;
    }
    return null;
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
