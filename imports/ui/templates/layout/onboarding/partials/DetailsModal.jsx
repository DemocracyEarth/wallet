import { bool, func } from 'prop-types';
import React, { Component } from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components';

import '../../../../css/react-modal.css';

import { Action, Actionbar, Container, Modal, Separator } from '../../../../styled/components/';
import { color, font, setHeight, setSpace, setType, track } from '../../../../styled/utils/';

const Logo = styled.img`
  ${setHeight('h')};
`;
const ModalBd = styled.div``;
const ModalTitle = styled.h1`
  ${setType('l')};
  ${setSpace('mbm')};
  color: ${color.white};
  font-family: ${font.mont};
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: ${track.m};
`;
const ModalSubtitle = styled.h2`
  ${setType('l')};
  color: ${color.white};
  font-family: ${font.lato};
  text-transform: none;
  border: none;
`;
const ModalText = styled.p`
  ${setType('m')};
  color: ${color.white};
  font-family: ${font.lato};
  text-transform: none;
`;

export default class DetailsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <ReactModal
        // aria={{ labelledby: 'heading', describedby: 'full_description' }}
        // bodyOpenClassName="ReactModal__Body--open"
        // className="ReactModal__Content"
        // closeTimeoutMS={0}
        // contentRef={setContentRef}
        // htmlOpenClassName="ReactModal__Html--open"
        // onAfterOpen={handleAfterOpenFunc}
        // onRequestClose={handleRequestCloseFunc}
        // overlayClassName="ReactModal__Overlay"
        // overlayRef={setOverlayRef}
        // parentSelector={() => document.body}
        // portalClassName="ReactModalPortal"
        // role="dialog"
        // shouldCloseOnEsc={true}
        // shouldCloseOnOverlayClick={true}
        // shouldFocusAfterRender={true}
        // shouldReturnFocusAfterClose={true}
        style={{
          overlay: {},
          content: {},
        }}
        ariaHideApp={false}
        contentLabel="About Democracy Earth"
        isOpen={this.props.isOpen}
      >
        <Modal>
          <Actionbar satellite="right">
            <Action iconic inverted onClick={this.props.onClose} secondary>
              ✕
            </Action>
          </Actionbar>
          <Separator silent size="s" />
          <Container limit="x" align="center">
            <Logo src="images/democracy-earth-inverted.png" alt="Democracy Earth" />
            <Separator silent size="l" />
            <ModalBd>
              <ModalTitle>Power In Your Hands</ModalTitle>
              <Separator silent size="s" />
              <ModalSubtitle>Welcome to a borderless peer to peer democracy. For anyone, anywhere.</ModalSubtitle>
              <Separator silent size="s" />
              <ModalText>Become self sovereign with our open source and decentralized democratic governance protocol for any kind of organization.</ModalText>
              <Separator silent size="l" />
              <Action block secondary inverted href="https://github.com/DemocracyEarth/paper" target="_blank">
                Read our white paper
              </Action>
              <Separator silent size="x" />
              <Action block secondary inverted href="https://www.democracy.earth/" target="_blank">
                Visit our web site
              </Action>
            </ModalBd>
          </Container>
          <Separator silent size="l" />
          <Actionbar>
            <Action fixed primary inverted onClick={this.props.onClose}>
              Got it
            </Action>
          </Actionbar>
        </Modal>
      </ReactModal>
    );
  }
}

DetailsModal.propTypes = {
  isOpen: bool,
  onClose: func.isRequired,
};

DetailsModal.defaultProps = {
  isOpen: false,
};
