import { array, object, oneOfType, string } from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import { color, setSpace } from '../../utils';

const ModalEl = styled.div`
  ${setSpace('pam')};
  background: ${color.eggplantM};
  color: ${color.white};
  min-height: 100vh;
  min-width: 100vw;
`;

const Modal = ({ children }) => {
  return <ModalEl>{children}</ModalEl>;
};

Modal.propTypes = {
  children: oneOfType([array, object, string]).isRequired,
};

Modal.defaultProps = {};

export default Modal;
