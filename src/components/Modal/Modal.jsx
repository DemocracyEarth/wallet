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
    title: PropTypes.string,
    message: PropTypes.string,
    mode: PropTypes.string,
  }

  render() {
    return (
      <div id="modalToggle" class="modal">
        <div class="alert">
          <div class="alert-header">
            <img class="alert-icon" src="{{pathFor route='home'}}{{icon}}" alt="" />
            <div class="modal-title">
              {this.props.title}
            </div>
          </div>
          <div>
            {this.props.message}
          </div>
          {(this.props.displayBallot) ?
            <p>
              <ul class="options options-mini">
                <li class="title-input title-input-mini">
                  {this.props.proposalTitle}
                </li>
                {this.props.ballot.map((item, key) => {
                  return <Choice />
                })}
              </ul>  
            </p>
            :
            null
          }
          {(this.props.awaitMode) ?
            <div class="modal-buttons">
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
          {(this.props.alertMode) ?
            <div class="modal-buttons">
              <div id="cancel" class="button login-button">
                <div>
                  {i18n.t('cancel')}
                </div>
              </div>
            </div>
            :
            null
          }
          {(this.props.actionMode) ?
            <div class="modal-buttons">
              <div class="modal-buttons-padder modal-buttons-padder-left">
                <div id="cancel" class="button login-button button-secondary button-half">
                  <div>{i18n.t('cancel')}</div>
                </div>
              </div>
              <div class="modal-buttons-padder modal-buttons-padder-right">
                <div id="execute" class="button login-button button-half {{removal}}">
                  <div>{i18n.t('action')}</div>
                </div>
              </div>
            </div>
            :
            null
          }
        </div>
      </div>
    );
  }
}

const _displayModal = (prop) => {
  console.log(prop);
}

export const displayModal = _displayModal;