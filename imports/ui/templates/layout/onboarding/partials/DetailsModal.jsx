import { bool } from 'prop-types';
import React, { Component } from 'react';
import ReactModal from 'react-modal';

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
        // style={{ overlay: {}, content: {} }}
        ariaHideApp={false}
        contentLabel="About Democracy Earth"
        isOpen={this.props.isOpen}
      >
        Howdy
      </ReactModal>
    );
  }
}

DetailsModal.propTypes = {
  isOpen: bool,
};

DetailsModal.defaultProps = {
  isOpen: false,
};
