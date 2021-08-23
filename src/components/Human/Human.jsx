import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { shortenCryptoName } from 'utils/strings';
import { config } from 'config';

import 'styles/Dapp.css';

const makeBlockie = require('ethereum-blockies-base64');

/**
* @summary renders a post in the timeline
*/
export default class Human extends Component {
  static propTypes = {
    publicAddress: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string,
    format: PropTypes.string,
    hidden: PropTypes.bool,
    icon: PropTypes.string,
    href: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {
      image: '',
      url: '',
      label: '',
      finalWidth: '',
      finalHeight: '',
    }
  }


  async componentDidMount() {
    this.default();
    await this.refresh();
  }

  async refresh() {
    await fetch(config.poh.profile.replace('{{publicAddress}}', this.props.publicAddress))
      .then((response) => {
        return response.json().then((data) => {
          if (data.statusCode !== 404) {
            this.setState({ 
              image: data.photo,
              label: data.display_name,
              url: data.profile,
            });
          }
          return data;
        }).catch((err) => {
          console.log(err);
        })
      });
  }

  async default() {
    this.setState({
      image: makeBlockie(this.props.publicAddress),
      label: shortenCryptoName(this.props.publicAddress),
      url: `${config.web.explorer.replace('{{publicAddress}}', this.props.publicAddress)}`,
      finalHeight: this.props.height || '24px',
      finalWidth: this.props.width || '24px',
    });
  }

  render() {
    return (
      <div className="identity">
        <div className="avatar-editor">
          <img src={this.state.image} className={`symbol profile-pic human`} alt="" style={{ width: this.state.finalWidth, height: this.state.finalHeight }} />
          {(this.props.format === 'plainText') ?
            <a href={this.state.url} title={this.props.publicAddress} onClick={(e) => { e.stopPropagation(); }}>
              {this.state.label}
            </a>
            :
            <div className="identity-peer">
              {(this.state.url.match('http')) ?
                <a href={this.state.url} target="_blank" rel="noopener noreferrer" title={this.props.publicAddress} className="identity-label identity-label-micro">
                  {this.state.label}
                </a>
                :
                <a href={this.state.url} target="_blank" rel="noopener noreferrer" title={this.props.publicAddress} className="identity-label identity-label-micro" onClick={(e) => { e.stopPropagation(); }}>
                  {this.state.label}
                </a>
              }
            </div>
          }
        </div>
      </div>
    );
  }
}
