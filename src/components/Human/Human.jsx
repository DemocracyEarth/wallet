import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getProvider } from 'lib/web3';
import { shortenCryptoName } from 'utils/strings';
import { config } from 'config';

import 'styles/Dapp.css';

const makeBlockie = require('ethereum-blockies-base64');
const Web3 = require('web3');

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
      css: ''
    }

    this.web3 = new Web3(getProvider());
    this.getImage = this.getImage.bind(this);
    this.getLabel = this.getLabel.bind(this);
  }


  async componentDidMount() {
    await this.refresh();
  }

  async refresh() {
    console.log(`request: ${config.poh.profile.replace('{{publicAddress}}', this.props.publicAddress)}`);

    const profile = await fetch(config.poh.profile.replace('{{publicAddress}}', this.props.publicAddress))
      .then((response) => {
        return response.json().then((data) => {
          console.log(data);
          console.log('Checking 404');
          if (data.statusCode === 404) {
            this.default();
          } else {
            this.setState({ 
              image: data.photo,
              label: data.display_name,
              url: data.profile
            });
          }
          return data;
        }).catch((err) => {
          console.log(err);
          console.log('HAHAH');
          this.default();
        })
      });

    if (this.web3 !== null) {
      await this.getImage();
      await this.getLabel();
    }
  }

  async default() {
    this.setState({
      image: makeBlockie(this.props.publicAddress),
      label: shortenCryptoName(this.props.publicAddress),
      url: `${config.web.explorer.replace('{{publicAddress}}', this.props.publicAddress)}`
    });
  }

  async getImage() {

  }

  async getLabel() {
  }

  render() {
    return (
      <div className="identity">
        <div className="avatar-editor">
          <img src={this.state.image} className={`symbol profile-pic ${this.state.css}`} alt="" style={{ width: this.state.finalWidth, height: this.state.finalHeight }} />
          {(this.props.format === 'plainText') ?
            <Link to={this.state.url} title={this.props.publicAddress} onClick={(e) => { e.stopPropagation(); }}>
              {this.state.label}
            </Link>
            :
            <div className="identity-peer">
              {(this.state.url.match('http')) ?
                <a href={this.state.url} target="_blank" rel="noopener noreferrer" title={this.props.publicAddress} className="identity-label identity-label-micro">
                  {this.state.label}
                </a>
                :
                <Link to={this.state.url} title={this.props.publicAddress} className="identity-label identity-label-micro" onClick={(e) => { e.stopPropagation(); }}>
                  {this.state.label}
                </Link>
              }
            </div>
          }
        </div>
      </div>
    );
  }
}
