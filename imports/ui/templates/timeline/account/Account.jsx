import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { shortenCryptoName } from '/imports/startup/both/modules/metamask';

const makeBlockie = require('ethereum-blockies-base64');

/**
* @summary renders a post in the timeline
*/
export default class Account extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.id,
      image: makeBlockie(props.publicAddress),
      url: `/address/${props.publicAddress}`,
      label: shortenCryptoName(props.publicAddress),
      width: props.width ? props.width : '24px',
      height: props.height ? props.height : '24px',
    };
  }

  render() {
    return (
      <div className="w-list-unstyled w-clearfix identity-list identity-feed-item extra">
        <div className="identity">
          <div className="avatar-editor">
            <img id={this.state.id} src={this.state.image} className="symbol profile-pic" role="presentation" style={{ width: this.state.width, height: this.state.height }} />
            <div className="identity-peer">
              <a href={this.state.url} title={this.props.publicAddress} className="identity-label identity-label-micro">
                {this.state.label}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Account.propTypes = {
  id: PropTypes.string,
  publicAddress: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
};
