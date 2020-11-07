import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Choice from 'components/Choice/Choice';

import i18n from 'i18n';
import BeatLoader from "react-spinners/BeatLoader";
import { css } from '@emotion/core';

import 'styles/Dapp.css';

const override = css`
  margin: 0 auto;
  border-color: var(--menu-sidebar-selected);
  display: inline-block;
`;

/**
* @summary displays the timestamp of a given post or event
*/
export default class Modal extends Component {
  static propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string,
    message: PropTypes.string,
    cancelLabel: PropTypes.string,
    mode: PropTypes.string,
    visible: PropTypes.bool,
    modal: PropTypes.object
  }

  constructor (props) {
    super(props);

    this.cancel = this.cancel.bind(this);
  }

  cancel() {
    console.log(`cancel`);
    window.showModal.value = false;
  }

  render() {
    return (
      ((this.props.visible) ?
        <div id="modalToggle" className="modal">
          <div className="alert">
            <div className="alert-header">
              <img className="alert-icon" src={this.props.icon} alt="" />
              <div className="modal-title">
                {this.props.modal.title}
              </div>
            </div>
            <div>
              {this.props.modal.message}
            </div>
            {(this.props.modal.displayBallot) ?
              <p>
                <ul className="options options-mini">
                  <li className="title-input title-input-mini">
                    {this.props.modal.proposalTitle}
                  </li>
                  {this.props.modal.ballot.map((item, key) => {
                    return <Choice />
                  })}
                </ul>
              </p>
              :
              null
            }
            {(this.props.modal.mode === 'AWAIT') ?
              <div className="modal-buttons">
                <BeatLoader
                  css={override}
                  size={15}
                  margin={2}
                  color={'var(--menu-sidebar-selected)'}
                  loading={true}
                />
              </div>
              :
              null
            }
            {(this.props.modal.mode === 'ALERT') ?
              <div className="modal-buttons">
                <div id="cancel" className="button login-button" onClick={this.cancel}>
                  <div>
                    {i18n.t('cancel')}
                  </div>
                </div>
              </div>
              :
              null
            }
            {(this.props.modal.mode === 'ACTION') ?
              <div className="modal-buttons">
                <div className="modal-buttons-padder modal-buttons-padder-left">
                  <div id="cancel" className="button login-button button-secondary button-half">
                    <div>{i18n.t('cancel')}</div>
                  </div>
                </div>
                <div className="modal-buttons-padder modal-buttons-padder-right">
                  <div id="execute" className="button login-button button-half {{removal}}">
                    <div>{i18n.t('action')}</div>
                  </div>
                </div>
              </div>
              :
              null
            }
          </div>
        </div>
        :
        null
      )
    );
  }
}

const _displayModal = (prop) => {
  console.log(prop);
}

export const displayModal = _displayModal;